import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DiscordLogoIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
  EnterIcon,
  ExitIcon,
} from "@radix-ui/react-icons";

import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Toaster } from "@/components/ui/toaster";
import { Crosshairs } from "../_components/crosshairs";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center bg-zinc-950 text-white">
        <div className="w-full p-8">
          <h1 className="text-4xl font-extrabold tracking-tight">
            AimRoutines.fyi
          </h1>
          <div className="absolute flex flex-col">
            <a href="/">&raquo; routines</a>
            <a href="#" className="text-rose-200">
              &raquo; resources
            </a>
          </div>
        </div>
        <div className="mb-[calc(74px+2rem)] flex w-full max-w-4xl flex-1 items-center justify-center">
          <Crosshairs />
        </div>
        {/* Extra mobile-friendly */}
        <div className="fixed bottom-0 z-50 flex h-[74px] items-center justify-center">
          <div>
            Built by&nbsp;
            <Link
              className="text-rose-200"
              href="https://x.com/ShishigamiTV"
              target="_blank"
            >
              @ShishigamiTV
            </Link>
          </div>
        </div>
        <div className="fixed bottom-0 flex w-full border-t-2 border-primary bg-zinc-950 p-4">
          {session ? (
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={session.user.image ?? ""} />
                <AvatarFallback>
                  {session.user.name?.substring(0, 2).toUpperCase() ?? "NA"}
                </AvatarFallback>
              </Avatar>
              {session.user.name}
              <Button variant="ghost" asChild className="text-slate-300">
                <Link href="/api/auth/signout">
                  <ExitIcon />
                  Sign out
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              <Button variant="ghost" asChild className="text-slate-300">
                <Link href="/api/auth/signin">
                  <EnterIcon />
                  Sign in
                </Link>
              </Button>
            </div>
          )}
          <div className="flex-1"></div>
          <div className="flex">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-primary-foreground"
            >
              <Link href="https://discord.gg/VafXRyC4zz" target="_blank">
                <DiscordLogoIcon />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-primary-foreground"
            >
              <Link href="https://x.com/ShishigamiTV" target="_blank">
                <TwitterLogoIcon />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-primary-foreground"
            >
              <Link
                href="https://github.com/shishigami87/aimroutines/"
                target="_blank"
              >
                <GitHubLogoIcon />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Toaster />
    </HydrateClient>
  );
}
