/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
export default function InfoCard({ contributor, minimal = true }) {
  return (
    <div
      className="-mt-24 py-10 px-6 text-center rounded-lg xl:px-10 xl:text-left"
      role="listitem"
    >
      <div className="flex flex-col items-center space-y-6 xl:space-y-1 ">
        <div className="flex items-center bg-gray-900 rounded-full p-4 w-64 h-64 relative z-10">
          <img
            className="mx-auto h-48 w-48 rounded-full border-2 border-indigo-500"
            src={`https://github.com/${contributor.github}.png`}
            alt={contributor.github}
          />
        </div>
        <div
          className={
            minimal
              ? "text-center"
              : "flex flex-col items-center justify-center text-center space-y-2"
          }
        >
          <div className="font-medium text-lg leading-6 space-y-1">
            <Link href={`/contributors/${contributor.github}`} className="">
              <h3 className="text-white hover:text-gray-900 hover:bg-primary-300 cursor-pointer">
                {contributor.name}
              </h3>
            </Link>
            <p className="text-primary-400">{contributor.title}</p>
          </div>

          <ul
            role="list"
            className={
              minimal
                ? "flex items-center space-x-2 justify-center mt-2"
                : "space-y-2"
            }
          >
            {contributor.github && (
              <li role="listitem">
                <a
                  href={`https://github.com/${contributor.github}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="text-gray-300 hover:text-primary-300 flex items-center">
                    <span className="sr-only">Github</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="mr-2 w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48C19.137 20.107 22 16.373 22 11.969 22 6.463 17.522 2 12 2z"
                      ></path>
                    </svg>
                    {!minimal && `@${contributor.github}`}
                  </div>
                </a>
              </li>
            )}
            {contributor.twitter && (
              <li role="listitem">
                <a
                  href={`https://twitter.com/${contributor.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="text-gray-300 hover:text-primary-300 flex items-center">
                    <span className="sr-only">Twitter</span>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                    {!minimal && `@${contributor.twitter}`}
                  </div>
                </a>
              </li>
            )}
            {contributor.linkedin && (
              <li role="listitem">
                <a
                  href={`https://linkedin.com/in/${contributor.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="text-gray-300 hover:text-primary-300 flex items-center">
                    <span className="sr-only">LinkedIn</span>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {!minimal && `@${contributor.linkedin}`}
                  </div>
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
