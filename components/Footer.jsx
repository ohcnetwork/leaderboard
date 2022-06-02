import Image from "next/image";

export default function Footer() {
  return (
    <footer className="">
      <div className="bg-gray-800 p-4 lg:p-10 border-t border-gray-700 h-full">
        <div className="max-w-5xl font-bold text-primary-500 text-center text-sm lg:leading-tight lg:mx-auto">
          <div className="flex items-center justify-center w-full">
            Powered by{" "}
            <span className={"w-20 ml-4"}>
              <Image
                src="/logo.webp"
                alt="Coronasafe"
                width="80"
                height="21.88"
                layout="responsive"
              />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
