import {themes as prismThemes} from 'prism-react-renderer';
const config = {
  title: 'Sai Kiran portfolio',
  tagline: 'full-stack developer',
  favicon: 'img/logo.svg',

  url: 'https://saikiran3321.github.io/',
  baseUrl: '/',
  
  organizationName: 'saikiran3321',
  projectName: 'dac-test',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      ({
        docs: {
          path: 'docs',
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/saikiran3321/saikiran3321',
        },
        blog: {
          path: 'blog',
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:'https://github.com/saikiran3321/saikiran3321',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    function myRoutes() {
      return {
        name: "custom-routes",
        async contentLoaded({ actions }) {
          const { addRoute } = actions;
          addRoute({
            path: "/",
            exact: true,
            component: "@site/src/pages/index.js",
          });
          addRoute({
            path: "/about",
            exact: true,
            component: "@site/src/components/about/index.js",
          });
          addRoute({
            path: "/projects",
            exact: true,
            component: "@site/src/components/projects/index.js",
          });
          addRoute({
            path: "/skills",
            exact: true,
            component: "@site/src/components/skills/index.js",
          });
          addRoute({
            path: "/contact",
            exact: true,
            component: "@site/src/components/contact/index.js",
          });
          addRoute({
            path: "/test",
            exact: true,
            component: "@site/src/components/test/index.js",
          });
        },
      };
    },
  ],


  themeConfig:
    ({
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: '',
        logo: {
          alt: 'Sai kiran Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            to: "/",
            html: '<span class="navbar-icon-wrapper"><img src="/img/home.svg" class="navbar-icon" /><span class="tooltip">Home</span></span>',
            position: "right",
          },
          {
            to: "/about",
            html: '<span class="navbar-icon-wrapper"><img src="/img/about.svg" class="navbar-icon" /><span class="tooltip">About</span></span>',
            position: "right",
          },
          {
            to: "/skills",
            html: '<span class="navbar-icon-wrapper"><img src="/img/skill.svg" class="navbar-icon" /><span class="tooltip">Skills</span></span>',
            position: "right",
          },
          {
            to: "/projects",
            html: '<span class="navbar-icon-wrapper"><img src="/img/project.svg" class="navbar-icon" /><span class="tooltip">Projects</span></span>',
            position: "right",
          },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'right',
            html: '<span class="navbar-icon-wrapper"><img src="/img/docs.svg" class="navbar-icon" /><span class="tooltip">Documents</span></span>',
          },
          {
            to: '/blog',
            html: '<span class="navbar-icon-wrapper"><img src="/img/blog.svg" class="navbar-icon" /><span class="tooltip">Blog</span></span>',
            position: 'right'
          },
          {
            to: "/contact",
            html: '<span class="navbar-icon-wrapper"><img src="/img/contact.svg" class="navbar-icon" /><span class="tooltip">Contact</span></span>',
            position: "right",
          },
          {
            to: "/test"
          }
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} Sai Kiran. All rights reserved.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
