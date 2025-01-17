import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const HomeHero = () => {
  return (
    <div className="relative isolate h-[calc(100vh-57px)] overflow-hidden bg-gray-50 dark:bg-gray-900">
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)] dark:stroke-white/10"
      >
        <defs>
          <pattern
            x="50%"
            y={-1}
            id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc"
            width={200}
            height={200}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <svg
          x="50%"
          y={-1}
          className="overflow-visible fill-gray-100 dark:fill-gray-800/20"
        >
          <path
            d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
            strokeWidth={0}
          />
        </svg>
        <rect
          fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)"
          width="100%"
          height="100%"
          strokeWidth={0}
        />
      </svg>
      <div
        aria-hidden="true"
        className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
      >
        <div
          style={{
            clipPath:
              "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
          }}
          className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20"
        />
      </div>
      <div className="mx-auto h-full max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto flex max-w-2xl shrink-0 items-center lg:mx-0">
          <div>
            <h1 className="text-pretty text-5xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
              Track Your Work Hours with Ease
            </h1>
            <p className="mt-6 text-pretty text-sm font-medium text-gray-600 dark:text-gray-400">
              Log, edit, and view your work hours effortlessly. Generate
              detailed reports and manage your earnings with our intuitive
              interface.
            </p>
            <div className="mt-6 flex items-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/signup">Get started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">
                  Sign in <span aria-hidden="true">→</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl items-center lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <Image
              alt="App screenshot"
              src="/screenshots/light.png"
              width={2432}
              height={1442}
              className=" w-[76rem] rounded-md bg-white/5 shadow-2xl ring-1 ring-black/5 dark:hidden dark:ring-white/10 lg:block"
            />
            <Image
              alt="App screenshot"
              src="/screenshots/dark.png"
              width={2432}
              height={1442}
              className="hidden w-[76rem] rounded-md bg-white/5 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 dark:lg:block"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
