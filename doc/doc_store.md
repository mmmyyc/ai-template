# YCamie Store Design Document（YCamie 商店设计文档）

## Database Schema（数据库架构）

### 1. Store Items Table (store_items)（商品表）
```sql
-- 创建商品表，包含以下字段：
-- id: 唯一标识符
-- user_id: 创建者ID
-- title: 商品标题
-- description: 商品描述
-- preview_url: 预览图片URL
-- download_url: 下载文件URL
-- price: 价格
-- type: 商品类型（基础版/高级版）
-- tags: 标签数组
-- downloads: 下载次数
-- likes: 点赞数
-- is_public: 是否公开
-- status: 商品状态（待审核/已通过等）
-- created_at: 创建时间
-- updated_at: 更新时间
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

-- 启用行级安全策略（RLS）
alter table store_items enable row level security;

-- 安全策略定义：
-- 1. 所有人可以查看公开且已审核的商品
-- 2. 用户只能添加自己的商品
-- 3. 用户只能更新自己的商品
create policy "Public items are viewable by everyone" on store_items
  for select using (is_public = true and status = 'approved');

create policy "Users can insert their own items" on store_items
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own items" on store_items
  for update using (auth.uid() = user_id);
```

### 2. Store Likes Table (store_likes)（点赞表）
```sql
-- 创建点赞表，记录用户对商品的点赞信息
-- id: 唯一标识符
-- user_id: 点赞用户ID
-- item_id: 被点赞商品ID
-- created_at: 点赞时间
create table store_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  item_id uuid references store_items(id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, item_id)
);

-- 启用行级安全策略
alter table store_likes enable row level security;

-- 安全策略定义：
-- 1. 所有人可以查看点赞记录
-- 2. 用户只能添加自己的点赞
-- 3. 用户只能删除自己的点赞
create policy "Users can view likes" on store_likes
  for select using (true);

create policy "Users can insert their own likes" on store_likes
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own likes" on store_likes
  for delete using (auth.uid() = user_id);
```

## API Endpoints（API 接口）

### 1. Store Items（商品接口）

#### List Items（获取商品列表）
```typescript
// GET /api/store/items
// 功能：获取商品列表，支持搜索、过滤和分页
// 参数：
// - query: 搜索关键词
// - type: 商品类型过滤
// - sort: 排序方式（最新/最受欢迎/最多点赞）
// - page: 页码
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

  // 根据关键词搜索标题和描述
  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }

  // 按类型过滤
  if (type) {
    queryBuilder = queryBuilder.eq('type', type);
  }

  // 设置排序方式
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

  // 实现分页
  const from = (page - 1) * limit;
  queryBuilder = queryBuilder.range(from, from + limit - 1);

  const { data: items, count, error } = await queryBuilder;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ items, count }));
}
```

#### Create Item（创建商品）
```typescript
// POST /api/store/items
// 功能：创建新商品
// 需要用户登录
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

### 2. Store Likes（点赞接口）

#### Toggle Like（切换点赞状态）
```typescript
// POST /api/store/likes
// 功能：切换商品的点赞状态（点赞/取消点赞）
// 需要用户登录
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
    // 如果已点赞，则取消点赞
    const { error: deleteError } = await supabase
      .from('store_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('item_id', item_id);

    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
    }

    // 更新商品点赞数（减1）
    await supabase.rpc('decrement_likes', { item_id });

    return new Response(JSON.stringify({ liked: false }));
  } else {
    // 如果未点赞，则添加点赞
    const { error: insertError } = await supabase
      .from('store_likes')
      .insert({ user_id: user.id, item_id });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
    }

    // 更新商品点赞数（加1）
    await supabase.rpc('increment_likes', { item_id });

    return new Response(JSON.stringify({ liked: true }));
  }
}
```

## Frontend Components（前端组件）

### 1. Store Page（商店页面）
```typescript
// app/store/page.tsx
// 商店主页组件，包含搜索、过滤和商品展示功能
export default function StorePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 当搜索条件变化时重新获取数据
  useEffect(() => {
    fetchItems();
  }, [query, type, sort, page]);

  // 获取商品列表数据
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
      {/* 搜索和过滤区域 */}
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

      {/* 商品网格展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <StoreItem key={item.id} item={item} />
        ))}
      </div>

      {/* 分页控件 */}
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

### 2. Store Item Component（商品卡片组件）
```typescript
// components/StoreItem.tsx
// 单个商品展示卡片组件
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

  // 处理点赞/取消点赞
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
      {/* 商品预览图 */}
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
      {/* 商品信息 */}
      <div className="card-body">
        <h2 className="card-title">{item.title}</h2>
        <p className="text-sm text-gray-600">{item.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-lg font-bold">
            {item.price > 0 ? `$${item.price}` : 'Free'}
          </span>
          <div className="flex items-center gap-4">
            {/* 下载次数 */}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {item.downloads}
            </span>
            {/* 点赞按钮 */}
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
   - 预览图：展示 Shimeji 的外观
   - 标题和描述：详细介绍商品信息
   - 价格显示：支持免费和付费商品
   - 数据统计：显示下载次数和点赞数
   - 分类标签：方便用户筛选

2. 搜索和过滤
   - 关键词搜索：可搜索标题和描述
   - 类型过滤：区分基础版和高级版
   - 多种排序：支持最新、最受欢迎、最多点赞等排序方式

3. 用户交互
   - 点赞功能：用户可以收藏喜欢的商品
   - 下载统计：记录商品受欢迎程度
   - 分页浏览：优化大量数据的展示

4. 权限控制
   - 公开/私有：控制商品可见性
   - 审核机制：确保商品质量
   - 用户权限：管理用户操作权限

## 注意事项

1. 性能优化
   - 图片优化：使用适当的图片格式和大小
   - 分页加载：避免一次加载过多数据
   - 缓存策略：减少服务器负载

2. 安全性
   - 文件存储：确保文件安全存储
   - 用户验证：防止未授权访问
   - 防止滥用：限制频繁操作

3. 用户体验
   - 加载提示：显示加载状态
   - 错误处理：友好的错误提示
   - 响应式设计：适配各种设备 