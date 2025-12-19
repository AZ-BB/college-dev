import Image from "next/image";

export default function CreateCommunity() {
  return (
    <div className="p-8 md:p-12">
      <div className="flex justify-center">
        <Image
          src="/Foreground.svg"
          alt="X post"
          width={900}
          height={500}
          className="h-90 w-90 rounded-2xl"
          priority
        />
      </div>
    </div>
  );
}
