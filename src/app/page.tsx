// import { auth0 } from "@/lib/auth0";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import Profile from "@/components/Profile";

export default async function Home() {
  const user = null;

  return (
    <main className="min-h-screen bg-[#060812] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[300px] md:h-[450px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] md:w-[600px] h-[200px] md:h-[300px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm md:max-w-md">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

          <div className="px-8 md:px-10 pt-9 md:pt-10 pb-9 md:pb-10 flex flex-col items-center gap-6 md:gap-7">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
               <span className="text-white font-black text-2xl">DCP</span>
            </div>

            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-semibold text-white tracking-[-0.02em]">
                Display & Cell Pros
              </h1>
              <p className="text-slate-500 text-sm md:text-[15px] mt-1.5">
                Spokane's Premier Mobile Repair Laboratory
              </p>
            </div>

            <div className="w-full h-px bg-white/[0.06]" />

            {user ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <Profile />
                <LogoutButton />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5 w-full">
                <p className="text-slate-400 text-sm md:text-[15px] text-center leading-relaxed tracking-[-0.01em]">
                  Welcome to the mobile triage hub. Access the interactive lab portal to manage diagnostic sessions.
                </p>
                <LoginButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
