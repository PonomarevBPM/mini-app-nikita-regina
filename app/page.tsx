import { MainForm } from "@/components/MainForm";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-[#E9E9E9] font-sans p-8 pb-20 sm:p-20 relative">
      <Image
        className="absolute top-0 left-0 z-0 w-full "
        src="/uzor.png"
        width={1000}
        height={1000}
        alt=""
      />
      <Image
        className="absolute bottom-0 left-0 -scale-y-100 z-0 w-full "
        src="/uzor.png"
        width={1000}
        height={1000}
        alt=""
      />
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start relative">
        <h2 className="text-4xl mt-4">АНКЕТА ГОСТЯ</h2>
        <Image
          className="absolute right-[10px] top-[50px] -scale-x-100"
          src="/logo.png"
          width={100}
          height={100}
          alt="Ежик"
        />
        <MainForm />
      </main>
    </div>
  );
}
