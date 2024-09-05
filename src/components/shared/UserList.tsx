import { cn } from "@/lib/utils";
import AddUser from "./AddUser";
import clsx from "clsx";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Skeleton } from "../ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";

type UserListProps = {
  className?: string;
  chatRooms: ChatRooms;
  setCurrentChat: React.Dispatch<React.SetStateAction<ChatRoom>>;
  currentChat: ChatRoom;
};

const UserList = ({
  className,
  chatRooms,
  setCurrentChat,
  currentChat,
}: UserListProps) => {
  const { auth } = useContext(AuthContext);

  const handleClick = async (v: ChatRoom) => {
    setCurrentChat(v);
    const chatRoomsRef = doc(db, "chatRooms", auth.uid);

    const data = await getDoc(chatRoomsRef);

    const chatData = data.data();
    if (data.exists()) {
      const chat: ChatRoom | undefined = chatData.chat.find(
        (i: ChatRoom) => i.chatId === v.chatId
      );

      if (chat) {
        const index = chatData.chat.indexOf(chat);

        if (!currentChat?.isSeen) {
          // update

          chatData.chat[index].isSeen = true;
          await updateDoc(chatRoomsRef, {
            chat: chatData.chat,
          });
        }
      }
    }
  };

  const [searchText, setSearchText] = useState("");

  const [filteredRooms, setFilteredRooms] = useState([]);
  const debouncedSearch = useDebounce(searchText, 500);

  useEffect(() => {
    if (chatRooms && chatRooms.length > 0) {
      const regex = RegExp(debouncedSearch, "i");
      const filtered = chatRooms.filter(
        (v) => regex.test(v.user?.name) || regex.test(v.lastMessage)
      );
      setFilteredRooms(filtered);
    }
  }, [debouncedSearch, chatRooms, searchText]);

  return (
    <div
      className={cn(
        "py-2 px-1 lg:px-4 border-r border-slate-300  space-y-8",
        className
      )}
    >
      <div className="flex  items-center gap-x-2 w-full ">
        <input
          onChange={(e) => setSearchText(e.target.value)}
          className="input rounded-full max-w-xl w-full px-4 py-2 border border-slate-300 focus:outline-none  placeholder:text-sm text-black-200 focus:border-blue-500 placeholder-gray-400 transition-all duration-300 shadow-md"
          placeholder="Search..."
          type="text"
        />
        <AddUser />
      </div>
      <div className="flex flex-col  ">
        {filteredRooms?.length > 0 ? (
          filteredRooms?.map((v: ChatRoom) => (
            <div
              onClick={() => handleClick(v)}
              key={v.chatId}
              className="flex cursor-pointer border-zinc-200 border-b  items-center gap-x-2 px-2 py-4"
            >
              <img
                src={v.user?.photoURL}
                alt="User"
                className="rounded-full object-contain size-12"
              />
              <div className="space-y- inline-block overflow-hidden">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-white">
                  {v.user?.name || "Error"}
                </h4>
                <p
                  className={clsx(
                    "text-sm truncate dark:text-emerald-100",
                    !v.isSeen
                      ? "font-extrabold text-[#000]"
                      : "text-slate-500 dark:text-slate-300  font-normal"
                  )}
                >
                  {v.lastMessage.length > 1
                    ? v.lastMessage
                    : "Chưa có tin nhắn"}
                </p>
              </div>
            </div>
          ))
        ) : currentChat === undefined ? (
          <h2 className="text-muted-foreground tracking-tight text-sm">
            Thêm người dùng để bắt đầu trò chuyện
          </h2>
        ) : chatRooms ? (
          <h2 className="text-sm text-muted-foreground tracking-tight">
            Không tìm thấy kết quả cho {searchText}
          </h2>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex  items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-2 w-[200px]" />
                  <Skeleton className="h-2 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
