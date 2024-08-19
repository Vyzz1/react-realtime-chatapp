import ChatDetails from "@/components/shared/ChatDetails";
import UserList from "@/components/shared/UserList";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MdOutlineSpeakerNotesOff } from "react-icons/md";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Main = () => {
  const { auth } = useContext(AuthContext);

  const [chatRooms, setChatRooms] = useState<ChatRooms>(null);

  const [currentChat, setCurrentChat] = useState<ChatRoom>(null);

  useEffect(() => {
    const unSubscribe = onSnapshot(
      doc(db, "chatRooms", auth.uid),
      async (doc) => {
        const items = doc.data().chat;

        const promisses = items.map(async (item) => {
          const userRef = collection(db, "users");
          const q = query(userRef, where("uid", "==", item.receiverId));

          const user = (await getDocs(q)).docs.map((doc) => doc.data())[0];

          return { ...item, user };
        });

        const chatData = (await Promise.all(promisses)) as ChatRooms;

        setChatRooms(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        setCurrentChat(chatData[0]);
      }
    );

    return () => {
      unSubscribe();
    };
  }, [auth.uid]);

  return (
    <section className="min-h-screen py-14  relative  px-4 ">
      <div className="flex justify-start lg:hidden mb-3">
        <Sheet>
          <SheetTrigger>
            <Button
              className="text-slate-600 border border-slate-300 "
              variant="ghost"
            >
              Danh sách chat
            </Button>
          </SheetTrigger>
          <SheetContent className="px-0">
            <UserList
              currentChat={currentChat}
              setCurrentChat={setCurrentChat}
              chatRooms={chatRooms}
              className="max-w-fit"
            />
          </SheetContent>
        </Sheet>
      </div>
      <div className="max-w-7xl gap-x-2 rounded-sm grid lg:grid-cols-10 grid-cols-1   py-2 border border-slate-400  mx-auto ">
        <UserList
          currentChat={currentChat}
          setCurrentChat={setCurrentChat}
          chatRooms={chatRooms}
          className="hidden lg:block  lg:col-span-3"
        />

        {currentChat !== undefined ? (
          <ChatDetails
            currentChat={currentChat}
            className="lg:col-span-7 w-full px-2"
          />
        ) : (
          currentChat === undefined && (
            <h2 className="col-span-7 ml-5 mt-5 text-lg text-muted-foreground">
              Bạn chưa có cuộc trò chuyện nào
              <MdOutlineSpeakerNotesOff className="size-8 ml-5 inline text-sky-300" />
            </h2>
          )
        )}
      </div>
    </section>
  );
};

export default Main;
