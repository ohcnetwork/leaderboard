A simple leaderboard app built with Next.js and Tailwind CSS to list the top contributors of a GitHub organization.

<img width="1822" alt="image" src="https://github.com/ohcnetwork/leaderboard/assets/25143503/6352a4cf-4b8b-4f80-b45c-6af323ee502e">

## Getting Started

### Prerequisites

Ensure that `pnpm` is installed on your device. You can check the steps for installation here. [Docs Link](https://pnpm.io/installation)

### Starting the development server

Install dependencies:

```bash
pnpm install
```

Now run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Troubleshooting

If you encounter any issues during setup, refer to the following troubleshooting tips:

- **Error: GITHUB_PAT is not configured in the environment. Request quota exhausted for request POST /graphql**

  - If you're facing this error for new contributors, follow these steps:

    1. Instead of running `pnpm dev`, create your own GitHub access token. [Read Steps here](https://docs.github.com/en/enterprise-server@3.9/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
    2. Run the following command instead:

       ```bash
       GITHUB_PAT=<YOUR_KEY> pnpm dev
       ```

  - Alternatively, if you have the `gh cli` installed and configured on your device, you can run the following command without creating an access token:

    ```bash
    GITHUB_PAT=$(gh auth token) pnpm dev
    ```

### Installing packages

To install new packages, run the following command:

```bash
pnpm add <package_name>
```

> _You can get more info about `pnpm` through their official docs [pnpm docs](https://pnpm.io/motivation)_

## How to add a new member?

Create a new markdown file with the GitHub user name in the `contributors` folder. For example, if you want to
add `john-doe` as a contributor, and create a file named `john-doe.md` in the `contributors` folder.

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
role: contributor
---

** A Bio about John Doe **  
_Passionate about creating scalable and distributed systems for the power grid and interested in contributing to open
source digital public goods._ (supports markdown)
```

All members marked with `role: core` and `role: operations` will be hidden from the leaderboard section by default. You can toggle their visibility by changing filters.

You will be able to see the user's profile page at `http://localhost:3000/contributors/john-doe`.

# Customizing the app

1. To add or remove a badge, edit the `config/GraduateAttributes.ts` file.

2. To Setup the repo for a new org, update
   the [scraper config](https://github.com/ohcnetwork/leaderboard/blob/060d88f1caf2190792beffaa464a2a48bfa6f2db/.github/workflows/scraper.yaml#L40) and update the `DATA_SOURCE` variable in the `.env` file to match the repo containing your organization data.

3. To change the colors, fonts, or plugins edit the `tailwind.config.js` file.

## Environment Variables

| Variable                          | Description                                                                                                     | Default                                                                                                                                                                                                                                                                                                                                                                                                         | Optional? |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **NEXT_PUBLIC_ORG_NAME**          | Will be displayed in the navbar                                                                                 | ohc.network                                                                                                                                                                                                                                                                                                                                                                                                     | No        |
| **NEXT_PUBLIC_ORG_INFO**          | Will be displayed in the "What do we do?" section.                                                              | Open Healthcare Network is a free and open-source disaster management system that is used by National Health Mission, Government of India and various state governments for reimaging digital war rooms. The solution that students got an opportunity to intern with has supported 3.34Lac patient management and 1.29 Lac ambulance shiftings and is approved by the United Nations as a Digital Public Good. | Yes       |
| **NEXT_PUBLIC_ORG_LOGO**          | Will be displayed in the footer.                                                                                | /logo.webp                                                                                                                                                                                                                                                                                                                                                                                                      | No        |
| **NEXT_PUBLIC_META_TITLE**        | Metadata title                                                                                                  | Open Healthcare Network                                                                                                                                                                                                                                                                                                                                                                                         | No        |
| **NEXT_PUBLIC_META_IMG**          | Metadata img                                                                                                    | /logo.webp                                                                                                                                                                                                                                                                                                                                                                                                      | No        |
| **NEXT_PUBLIC_META_DESCRIPTION**  | Metadata description                                                                                            | ohc.network Leaderboard tracks the weekly progress of all ohc.network contributors.                                                                                                                                                                                                                                                                                                                              | No        |
| **NEXT_PUBLIC_META_URL**          | Metadata url                                                                                                    | https://leaderboard.ohc.network                                                                                                                                                                                                                                                                                                                                                                                 | No        |
| **NEXT_PUBLIC_PAGE_TITLE**        | Will be displayed in page title.                                                                                | OHC Network Contributors                                                                                                                                                                                                                                                                                                                                                                                        | No        |
| **NEXT_PUBLIC_CONTRIBUTORS_INFO** | Will be displayed next to "Our Contributors" section. You can use it to display a note about your contributors. |                                                                                                                                                                                                                                                                                                                                                                                                                 | Yes       |
| **DATA_SOURCE**                   | Url for data repository                                                                                         | https://github.com/ohcnetwork/leaderboard-data.git                                                                                                                                                                                                                                                                                                                                                              | Yes       |
| **NEXT_PUBLIC_FEATURES**                   | These features will be displayed                                                                                    | Leaderboard,Contributors,Feed,Releases,                                                                                                                               | Yes       |