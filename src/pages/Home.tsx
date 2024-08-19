import AnimatedGridPattern from "@/components/ui/GridPatterns";
import { cn } from "@/lib/utils";
import GradualSpacing from "@/components/ui/GradualSpacing";
import LoginHandler from "@/components/shared/LoginHandler";
const Home = () => {
  return (
    <section className="relative flex h-screen w-full  items-center flex-col  overflow-hidden rounded-lg border bg-background ">
      <GradualSpacing
        className="text-center mt-12 text-xl xs:text-4xl font-semibold tracking-[-0.15rem]  text-blue-400 dark:text-white md:text-7xl   md:leading-[5rem] shadow-sm"
        text="Welcome To Vibra Chat"
      />
      <LoginHandler className="mt-16" />

      <AnimatedGridPattern
        numSquares={45}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 "
        )}
      />
    </section>
  );
};

export default Home;
