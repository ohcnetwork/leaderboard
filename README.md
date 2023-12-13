A simple leaderboard app built with Next.js and Tailwind CSS to list top contributors of a GitHub organization.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to add a new member?

Create a new markdown file with the github user name in the `contributors` folder. For example, if you want to add `john-doe` as a contributor, create a file named `john-doe.md` in the `contributors` folder.

The file should contain the following content:

```md
---
name: John Doe
title: Full Stack Developer
github: john-doe
twitter: john-doe
linkedin: john-doe
slack: U02TDGQQPMJ
joining_date: "09/05/2022"
core: false
intern: true
operations: false
---

** A Bio about John Doe **
_Passionate about creating scalable and distributed systems for the power grid and interested in contributing to open source digital public goods._ (supports markdown)
```

All members marked with `core: true` will be listed in the core team section, they will be hidden from the leaderboard section by default. You can toggle the visibility of core team members by clicking on the `Core Team` button.

All members marked with `operations: true` will be will be hidden from the leaderboard section.

You will be able to see the users profile page at `http://localhost:3000/contributors/john-doe`.

## Customizing the app

1. To add or remove a badge, edit the `config/GraduateAttributes.ts` file.

2. To Setup the repo for a new org, update the [scraper config](https://github.com/coronasafe/leaderboard/blob/d42c7b7ba608c4911d932e92679ab1914371c8a0/.github/workflows/main.yml#L32)

3. To change the colors, fonts, or plugins edit the `tailwind.config.js` file.

### Environment Variables

#### **Organization Details**

- **NEXT_PUBLIC_ORG_NAME**
  - Will be displayed in the navbar.
- **NEXT_PUBLIC_ORG_INFO**
  - (Optional) Will be displayed in the "What do we do?" section.
- **NEXT_PUBLIC_ORG_LOGO**
  - Will be displayed in the footer.

#### **SEO details**

- **NEXT_PUBLIC_META_TITLE**
- **NEXT_PUBLIC_META_IMG**
- **NEXT_PUBLIC_META_DESCRIPTION**
- **NEXT_PUBLIC_META_URL**

#### **Page Details**

- **NEXT_PUBLIC_PAGE_TITLE**
  - Will be displayed in page title.
- **NEXT_PUBLIC_CONTRIBUTORS_INFO**
  - (Optional) Will be displayed next to "Our Contributors" section. You can use it to display a note about your contributors.
