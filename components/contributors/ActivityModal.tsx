import { Dialog, Transition } from "@headlessui/react";
import { type } from "os";
import { Fragment } from "react";

type ActivityData = {
  date?: string;
  pr_reviewed?: number;
  pr_opened?: number;
  pr_merged?: number;
  issue_opened?: number;
  issue_closed?: number;
  eod_update?: number;
  comment_created?: number;
};

export default function ActivityModal({
  isopen,
  closeFunc,
  activityData,
}: {
  isopen: boolean;
  closeFunc: () => void;
  activityData: ActivityData;
}) {
  return (
    <>
      <Transition appear show={isopen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeFunc}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-96 overflow-hidden rounded-xl bg-secondary-800 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="mb-3 flow-root">
                    <Dialog.Title
                      as="h3"
                      className="float-left text-xl font-bold leading-6 text-secondary-50"
                    >
                      Activity on {activityData?.date}
                    </Dialog.Title>
                    <div className="float-right">
                      <button
                        type="button"
                        className="text-secondary-200 hover:text-secondary-300 focus:outline-none active:outline-none"
                        onClick={closeFunc}
                      >
                        ✖
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    {activityData?.pr_opened && (
                      <p className="text-base text-secondary-200">
                        <span className="font-semibold">PRs Opened:</span>{" "}
                        {activityData.pr_opened}
                      </p>
                    )}
                    {activityData?.pr_merged && (
                      <p className="text-base text-secondary-200">
                        <span className="font-semibold">PRs Merged:</span>{" "}
                        {activityData.pr_merged}
                      </p>
                    )}
                    {activityData?.pr_reviewed && (
                      <p className="text-base text-secondary-200">
                        <span className="font-semibold">PRs Reviewed:</span>{" "}
                        {activityData.pr_reviewed}
                      </p>
                    )}
                    {activityData?.eod_update && (
                      <p className="text-base text-secondary-200">
                        <span className="font-semibold">EOD Updates:</span>{" "}
                        {activityData.eod_update}
                      </p>
                    )}
                    {activityData?.issue_opened && (
                      <p className="text-base text-secondary-200">
                        <span className="font-semibold">Issues Opened:</span>{" "}
                        {activityData.issue_opened}
                      </p>
                    )}
                    {activityData?.issue_closed && (
                      <p className="text-base text-secondary-200">
                        <span className="font-semibold">Issues Closed:</span>{" "}
                        {activityData.issue_closed}
                      </p>
                    )}
                    {activityData?.comment_created && (
                      <p className="text-base text-secondary-200">
                        <span className="font-semibold">Comments Created:</span>{" "}
                        {activityData.comment_created}
                      </p>
                    )}

                    <div className=" text-secondary-200">
                      {!activityData?.pr_reviewed &&
                      !activityData?.pr_opened &&
                      !activityData?.pr_merged &&
                      !activityData?.comment_created &&
                      !activityData?.issue_closed &&
                      !activityData?.issue_opened &&
                      !activityData?.eod_update
                        ? "No activity found!"
                        : ""}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
