import Link from "next/link";

export default function Header(){
    return (
        <header className="max-w-6xl mx-auto py-4 lg:py-8 px-4 xl:px-0">
            <div className="flex justify-between items-center">
                <Link className="inline-block cursor-pointer" href="/">
                    <code className="text-primary-900 cursor-pointer text-3xl">
                        coronasafe.network contributors
                    </code>
                </Link>
            </div>
        </header>
    )
}