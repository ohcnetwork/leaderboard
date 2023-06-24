import { Dispatch, SetStateAction } from 'react';
import IconToggle from './IconToggle';
import Search from './Search';
import Sort from './Sort';
import Tooltip from './Tooltip';
import { BiShow, BiHide } from 'react-icons/bi';

const Filters = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortDescending,
  setSortDescending,
  showCoreMembers,
  setShowCoreMembers,
}: {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  sortBy: string;
  setSortBy: Dispatch<SetStateAction<string>>;
  sortDescending: boolean;
  setSortDescending: Dispatch<SetStateAction<boolean>>;
  showCoreMembers: boolean;
  setShowCoreMembers: Dispatch<SetStateAction<boolean>>;
}) => {
  const sortParams = [
    { value: 'comment_created', text: 'Comment Created' },
    { value: 'eod_update', text: 'EOD Update' },
    { value: 'issue_assigned', text: 'Issue Assigned' },
    { value: 'issue_opened', text: 'Issue Opened' },
    { value: 'points', text: 'Points' },
    { value: 'pr_merged', text: 'PR Merged' },
    { value: 'pr_opened', text: 'PR Opened' },
    { value: 'pr_reviewed', text: 'PR Reviewed' },
    { value: 'pr_stale', text: 'Stale PRs' },
  ];

  return (
    <div className="mx-4 md:mx-0 mt-4 p-4 border border-primary-500 rounded-lg">
      <div className="flex flex-col md:flex-row justify-evenly items-center md:items-start gap-4">
        <Search
          value={searchTerm}
          handleOnChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <div className="w-full flex items-end justify-start gap-2">
          <Sort
            sortByOptions={sortParams}
            sortBy={sortBy}
            sortDescending={sortDescending}
            handleSortByChange={(e) => setSortBy(e.target.value)}
            handleSortOrderChange={() => setSortDescending((prev) => !prev)}
            className="w-full"
          />
          <Tooltip
            tip={showCoreMembers ? 'Hide Core Members' : 'Show Core Members'}
            tipStyle="bottom-9 -right-16 w-48 text-white text-sm"
          >
            <IconToggle
              state={showCoreMembers}
              TrueIcon={BiHide}
              FalseIcon={BiShow}
              handleOnClick={() => setShowCoreMembers((prev) => !prev)}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default Filters;
