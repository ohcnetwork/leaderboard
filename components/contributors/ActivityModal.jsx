import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function ActivityModal({ isopen, closeFunc, activityData }) {
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
            <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                <Dialog.Panel className="w-96 transform overflow-hidden rounded-xl bg-gray-700 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flow-root mb-3">
                    <Dialog.Title
                      as="h3"
                      className="text-xl leading-6 text-gray-50 float-left font-bold"
                    >
                      Activity on {activityData?.date}
                    </Dialog.Title>
                    <div className="float-right">
                      <button
                        type="button"
                        className="text-gray-100 focus:outline-none active:outline-none hover:text-gray-300"
                        onClick={closeFunc}
                      >
                        ✖
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    {activityData?.pr_opened && (
                      <p className="text-base text-gray-100">
                        <span className="font-semibold">PRs Opened:</span>{' '}
                        {activityData.pr_opened}
                      </p>
                    )}
                    {activityData?.pr_merged && (
                      <p className="text-base text-gray-100">
                        <span className="font-semibold">PRs Merged:</span>{' '}
                        {activityData.pr_merged}
                      </p>
                    )}
                    {activityData?.pr_reviewed && (
                      <p className="text-base text-gray-100">
                        <span className="font-semibold">PRs Reviewed:</span>{' '}
                        {activityData.pr_reviewed}
                      </p>
                    )}
                    {activityData?.eod_update && (
                      <p className="text-base text-gray-100">
                        <span className="font-semibold">EOD Updates:</span>{' '}
                        {activityData.eod_update}
                      </p>
                    )}
                    {activityData?.issue_opened && (
                      <p className="text-base text-gray-100">
                        <span className="font-semibold">Issues Opened:</span>{' '}
                        {activityData.issue_opened}
                      </p>
                    )}
                    {activityData?.issue_closed && (
                      <p className="text-base text-gray-100">
                        <span className="font-semibold">Issues Closed:</span>{' '}
                        {activityData.issue_closed}
                      </p>
                    )}
                    {activityData?.comment_created && (
                      <p className="text-base text-gray-100">
                        <span className="font-semibold">Comments Created:</span>{' '}
                        {activityData.comment_created}
                      </p>
                    )}

                    <div className=" text-gray-100">
                      {!activityData?.pr_reviewed &&
                      !activityData?.pr_opened &&
                      !activityData?.pr_merged &&
                      !activityData?.comment_created &&
                      !activityData?.issue_closed &&
                      !activityData?.issue_opened &&
                      !activityData?.eod_update
                        ? 'No activity found!'
                        : ''}
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
