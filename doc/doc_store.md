# YCamie Store Design Document

## Database Schema

### 1. Store Items Table (store_items)
```sql
create table store_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  title text not null,
  description text,
  preview_url text not null,
  download_url text not null,
  price decimal(10,2) default 0,
  type varchar(20) default 'basic',
  tags text[] default '{}',
  downloads int default 0,
  likes int default 0,
  is_public boolean default true,
  status varchar(20) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table store_items enable row level security;

-- Policies
create policy "Public items are viewable by everyone" on store_items
  for select using (is_public = true and status = 'approved');

create policy "Users can insert their own items" on store_items
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own items" on store_items
  for update using (auth.uid() = user_id);
```

### 2. Store Likes Table (store_likes)
```sql
create table store_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  item_id uuid references store_items(id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, item_id)
);

-- Enable RLS
alter table store_likes enable row level security;

-- Policies
create policy "Users can view likes" on store_likes
  for select using (true);

create policy "Users can insert their own likes" on store_likes
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own likes" on store_likes
  for delete using (auth.uid() = user_id);
```

## API Endpoints

### 1. Store Items

#### List Items
```typescript
// GET /api/store/items
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const type = searchParams.get('type') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 12;

  const supabase = createClient();
  
  let queryBuilder = supabase
    .from('store_items')
    .select('*', { count: 'exact' })
    .eq('is_public', true)
    .eq('status', 'approved');

  // 搜索
  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }

  // 类型过滤
  if (type) {
    queryBuilder = queryBuilder.eq('type', type);
  }

  // 排序
  switch (sort) {
    case 'popular':
      queryBuilder = queryBuilder.order('downloads', { ascending: false });
      break;
    case 'likes':
      queryBuilder = queryBuilder.order('likes', { ascending: false });
      break;
    default:
      queryBuilder = queryBuilder.order('created_at', { ascending: false });
  }

  // 分页
  const from = (page - 1) * limit;
  queryBuilder = queryBuilder.range(from, from + limit - 1);

  const { data: items, count, error } = await queryBuilder;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ items, count }));
}
```

#### Create Item
```typescript
// POST /api/store/items
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { title, description, preview_url, download_url, price, type, tags } = body;

  const { data, error } = await supabase
    .from('store_items')
    .insert({
      user_id: user.id,
      title,
      description,
      preview_url,
      download_url,
      price,
      type,
      tags
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data));
}
```

### 2. Store Likes

#### Toggle Like
```typescript
// POST /api/store/likes
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { item_id } = await request.json();

  // 检查是否已经点赞
  const { data: existingLike } = await supabase
    .from('store_likes')
    .select()
    .eq('user_id', user.id)
    .eq('item_id', item_id)
    .single();

  if (existingLike) {
    // 取消点赞
    const { error: deleteError } = await supabase
      .from('store_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('item_id', item_id);

    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
    }

    // 更新商品点赞数
    await supabase.rpc('decrement_likes', { item_id });

    return new Response(JSON.stringify({ liked: false }));
  } else {
    // 添加点赞
    const { error: insertError } = await supabase
      .from('store_likes')
      .insert({ user_id: user.id, item_id });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
    }

    // 更新商品点赞数
    await supabase.rpc('increment_likes', { item_id });

    return new Response(JSON.stringify({ liked: true }));
  }
}
```

## Frontend Components

### 1. Store Page
```typescript
// app/store/page.tsx
export default function StorePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchItems();
  }, [query, type, sort, page]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/store/items?query=${query}&type=${type}&sort=${sort}&page=${page}`
      );
      const { items, count } = await response.json();
      setItems(items);
      setTotalCount(count);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 搜索和过滤 */}
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Search Shimeji..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input input-bordered w-full max-w-xs"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="select select-bordered"
        >
          <option value="">All Types</option>
          <option value="basic">Basic</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="select select-bordered"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Downloaded</option>
          <option value="likes">Most Liked</option>
        </select>
      </div>

      {/* 商品网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <StoreItem key={item.id} item={item} />
        ))}
      </div>

      {/* 分页 */}
      <div className="flex justify-center mt-8">
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(totalCount / 12)}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
```

### 2. Store Item Component
```typescript
// components/StoreItem.tsx
interface StoreItemProps {
  item: {
    id: string;
    title: string;
    description: string;
    preview_url: string;
    price: number;
    downloads: number;
    likes: number;
  };
}

export function StoreItem({ item }: StoreItemProps) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/store/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: item.id })
      });
      const { liked } = await response.json();
      setLiked(liked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <figure className="px-4 pt-4">
        <Image
          src={item.preview_url}
          alt={item.title}
          className="rounded-xl"
          width={300}
          height={300}
          objectFit="cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{item.title}</h2>
        <p className="text-sm text-gray-600">{item.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-lg font-bold">
            {item.price > 0 ? `$${item.price}` : 'Free'}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {item.downloads}
            </span>
            <button
              onClick={handleLike}
              disabled={loading}
              className={`btn btn-circle btn-sm ${liked ? 'btn-primary' : 'btn-outline'}`}
            >
              <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 功能特点

1. 商品展示
   - 预览图
   - 标题和描述
   - 价格（免费/付费）
   - 下载次数和点赞数
   - 分类标签

2. 搜索和过滤
   - 关键词搜索（标题和描述）
   - 类型过滤（基础版/高级版）
   - 排序（最新/最受欢迎/最多点赞）

3. 用户交互
   - 点赞功能
   - 下载统计
   - 分页浏览

4. 权限控制
   - 公开/私有商品
   - 审核机制
   - 用户权限管理

## 注意事项

1. 性能优化
   - 图片优化和懒加载
   - 分页加载
   - 缓存策略

2. 安全性
   - 文件存储安全
   - 用户权限验证
   - 防止滥用

3. 用户体验
   - 加载状态提示
   - 错误处理
   - 响应式设计 