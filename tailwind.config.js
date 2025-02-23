module.exports = {
    darkMode: ["class"],
    content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/globals.css",
  ],
  theme: {
extend: {
	backgroundImage: {
		gradient: 'linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82)'
	},
	animation: {
		opacity: 'opacity 0.25s ease-in-out',
		appearFromRight: 'appearFromRight 300ms ease-in-out',
		wiggle: 'wiggle 1.5s ease-in-out infinite',
		popup: 'popup 0.25s ease-in-out',
		shimmer: 'shimmer 3s ease-out infinite alternate'
	},
	keyframes: {
		opacity: {
			'0%': {
				opacity: 0
			},
			'100%': {
				opacity: 1
			}
		},
		appearFromRight: {
			'0%': {
				opacity: 0.3,
				transform: 'translate(15%, 0px);'
			},
			'100%': {
				opacity: 1,
				transform: 'translate(0);'
			}
		},
		wiggle: {
			'0%, 20%, 80%, 100%': {
				transform: 'rotate(0deg)'
			},
			'30%, 60%': {
				transform: 'rotate(-2deg)'
			},
			'40%, 70%': {
				transform: 'rotate(2deg)'
			},
			'45%': {
				transform: 'rotate(-4deg)'
			},
			'55%': {
				transform: 'rotate(4deg)'
			}
		},
		popup: {
			'0%': {
				transform: 'scale(0.8)',
				opacity: 0.8
			},
			'50%': {
				transform: 'scale(1.1)',
				opacity: 1
			},
			'100%': {
				transform: 'scale(1)',
				opacity: 1
			}
		},
		shimmer: {
			'0%': {
				backgroundPosition: '0 50%'
			},
			'50%': {
				backgroundPosition: '100% 50%'
			},
			'100%': {
				backgroundPosition: '0% 50%'
			}
		},
		'aurora-border': {
			'0%, 100%': {
				borderRadius: '37% 29% 27% 27% / 28% 25% 41% 37%'
			},
			'25%': {
				borderRadius: '47% 29% 39% 49% / 61% 19% 66% 26%'
			},
			'50%': {
				borderRadius: '57% 23% 47% 72% / 63% 17% 66% 33%'
			},
			'75%': {
				borderRadius: '28% 49% 29% 100% / 93% 20% 64% 25%'
			}
		},
		'aurora-1': {
			'0%, 100%': {
				top: '0',
				right: '0'
			},
			'50%': {
				top: '50%',
				right: '25%'
			},
			'75%': {
				top: '25%',
				right: '50%'
			}
		},
		'aurora-2': {
			'0%, 100%': {
				top: '0',
				left: '0'
			},
			'60%': {
				top: '75%',
				left: '25%'
			},
			'85%': {
				top: '50%',
				left: '50%'
			}
		},
		'aurora-3': {
			'0%, 100%': {
				bottom: '0',
				left: '0'
			},
			'40%': {
				bottom: '50%',
				left: '25%'
			},
			'65%': {
				bottom: '25%',
				left: '50%'
			}
		},
		'aurora-4': {
			'0%, 100%': {
				bottom: '0',
				right: '0'
			},
			'50%': {
				bottom: '25%',
				right: '40%'
			},
			'90%': {
				bottom: '50%',
				right: '25%'
			}
		}
	},
	borderRadius: {
		lg: 'var(--radius)',
		md: 'calc(var(--radius) - 2px)',
		sm: 'calc(var(--radius) - 4px)'
	},
	colors: {
		sidebar: {
			DEFAULT: 'hsl(var(--sidebar-background))',
			foreground: 'hsl(var(--sidebar-foreground))',
			primary: 'hsl(var(--sidebar-primary))',
			'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
			accent: 'hsl(var(--sidebar-accent))',
			'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
			border: 'hsl(var(--sidebar-border))',
			ring: 'hsl(var(--sidebar-ring))'
		},
		'color-1': 'hsl(var(--color-1))',
		'color-2': 'hsl(var(--color-2))',
		'color-3': 'hsl(var(--color-3))',
		'color-4': 'hsl(var(--color-4))',
		'color-5': 'hsl(var(--color-5))'
	}
}
  },
  plugins: [require("daisyui"), require("tailwindcss-animate")],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula"
    ],
  },
};
