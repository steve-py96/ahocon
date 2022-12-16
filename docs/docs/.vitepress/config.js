import { defineConfig } from 'vitepress';

export default defineConfig({
  base: '/ahocon/',
  title: 'AHOCON',
  description: 'AHOCON documentation - powered by vitepress ❤️',
  themeConfig: {
    socialLinks: [{ icon: 'github', link: 'https://github.com/steve-py96/ahocon' }],
    sidebar: [
      {
        text: '',
        collapsible: false,
        items: [
          {
            text: 'getting started',
            link: '/',
          },
          {
            text: 'package',
            link: '/package',
          },
          {
            text: 'grammar',
            link: '/grammar',
          },
          {
            text: 'advanced',
            link: '/advanced',
          },
        ],
      },
      {
        text: '',
        items: [
          {
            text: 'made with vitepress ❤️',
            link: 'https://vitepress.vuejs.org/',
          },
        ],
      },
    ],
  },
});
