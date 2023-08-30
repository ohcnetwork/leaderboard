/* eslint-disable @next/next/no-img-element */
import { Category, Contributor } from '@/lib/types';
import Link from 'next/link';
export default function InfoCard({
  contributor,
  minimal = false,
  category,
}: {
  contributor: Contributor;
  minimal?: boolean;
  category: Category;
}) {
  return (
    <div
      className="py-6 px-2 bg-gray-100 dark:bg-gray-800 text-center rounded-lg xl:px-10 xl:text-left"
      role="listitem"
    >
      <span className="text-foreground text-sm font-sans">
        Most number of {category.title}
      </span>
      <div className="flex">
        <div className="mx-auto mt-2 flex items-center gap-2">
          <img
            className="h-12 w-12 rounded-full"
            src={`https://avatars.githubusercontent.com/${contributor.github}`}
            alt={contributor.github}
          />
          <div className={minimal ? 'text-center' : 'space-y-2'}>
            <div className="font-medium text-lg leading-6 space-y-1">
              <Link href={`/contributors/${contributor.github}`} className="">
                <h3 className="text-white hover:text-gray-900 hover:bg-primary-300 cursor-pointer">
                  {/* {category.title} */}
                </h3>
              </Link>
              <p className="text-primary-400">{contributor.name}</p>
            </div>

            <ul
              role="list"
              className={
                minimal
                  ? 'flex items-center space-x-2 justify-center mt-2'
                  : 'space-y-2'
              }
            ></ul>
          </div>
        </div>
      </div>
    </div>
  );
}
