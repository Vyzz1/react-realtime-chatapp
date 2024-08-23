import { cn } from "@/lib/utils";
import {
  EllipsisIcon,
  ImageIcon,
  MessageSquareIcon,
  SendHorizonalIcon,
  ShieldMinusIcon,
  SmileIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import EmojiPicker from "emoji-picker-react";
import { useContext, useEffect, useRef, useState } from "react";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AuthContext } from "@/context/AuthContext";
import upload from "@/lib/upload";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { calTime } from "@/lib/calculateTime";
import { Skeleton } from "../ui/skeleton";
import Loading from "./Loading";
import { useToast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import clsx from "clsx";

type ChatDetailsProps = {
  className?: string;
  currentChat: ChatRoom;
};

const ChatDetails = ({ className, currentChat }: ChatDetailsProps) => {
  // State for text input
  const [text, setText] = useState<string>("");
  // State for messages
  const [messages, setMessages] = useState<Messages>(null);

  // State for loading
  const [loading, setLoading] = useState(false);

  // State for block list
  const [blockList, setBlockList] = useState<string[]>([]);
  // State for blocked by
  const [blockedBy, setBlockedBy] = useState<string[]>([]);

  // Check if user is blocked
  const isBlocked = blockList?.includes(currentChat?.user?.uid);

  // Check if user is being blocked
  const isBeingBlocked = blockedBy?.includes(currentChat?.user?.uid);

  // Check if user is disabled
  const isDisabled = isBlocked || isBeingBlocked || loading;

  // Get auth context
  const { auth } = useContext(AuthContext);

  const chatId = currentChat?.chatId;
  const { toast } = useToast();

  // Get messages
  useEffect(() => {
    const unSubscribe =
      chatId &&
      onSnapshot(doc(db, "chats", chatId), (doc) => {
        setMessages(doc.data().messages);
      });

    return () => {
      if (chatId) unSubscribe();
    };
  }, [chatId]);

  const ref = useRef<HTMLDivElement>(null);

  const handleUploadImage = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[e.target.files.length - 1];

    // Tải ảnh lên và lấy link URL
    setLoading(true);
    const url = (await upload(file)) as string;

    // Cập nhật state 'image' và 'link' sau khi đã có URL của ảnh

    // Sau khi có URL của ảnh, gửi tin nhắn
    handleSendMessage("Upload", url);
  };

  // Gửi tin nhắn

  async function handleSendMessage(
    type: "Upload" | "Text",
    imageUrl?: string,
    isLike?: boolean
  ) {
    if (type === "Text" && text.trim() === "" && !isLike) return;
    if (type === "Upload" && !imageUrl) return;

    try {
      setLoading(true);

      const message = {
        sendBy: auth.uid,
        text: type === "Upload" ? "Đã gửi ảnh" : isLike ? "👍" : text,
        sentAt: new Date(),
        ...(imageUrl && { imageUrl }),
      };

      const chatRef = doc(db, "chats", currentChat.chatId);
      await updateDoc(chatRef, {
        messages: arrayUnion(message),
      });

      const userIDs = [currentChat.user.uid, auth.uid];

      userIDs.forEach(async (id) => {
        const chatRoomRef = doc(db, "chatRooms", id);

        const chatRooms = await getDoc(chatRoomRef);

        if (chatRooms.exists()) {
          const data = chatRooms.data();

          const chatDocs = data.chat.find((v: ChatRoom) => v.chatId === chatId);
          const index = data.chat.indexOf(chatDocs);

          data.chat[index].lastMessage =
            type === "Upload" ? "Đã gửi ảnh" : isLike ? "👍" : text;

          data.chat[index].updatedAt = Date.now();

          data.chat[index].isSeen = id === auth.uid ? true : false;

          await updateDoc(chatRoomRef, {
            chat: data.chat,
          });
        }
      });
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setLoading(false);
      setText("");
    }
  }

  // Get block list
  useEffect(() => {
    const unSubscribe = onSnapshot(doc(db, "users", auth.uid), (doc) => {
      setBlockList(doc.data().blockList);
      setBlockedBy(doc.data().blockBy);
    });

    return () => {
      unSubscribe();
    };
  }, [auth.uid]);

  // Handle like

  const handleLike = async () => {
    await handleSendMessage("Text", null, true);
  };

  // Handle block user
  async function handleBlockUser() {
    try {
      const userRef = doc(db, "users", auth.uid);
      const userBlockedRef = doc(db, "users", currentChat.user.uid);

      await updateDoc(userRef, {
        blockList: isBlocked
          ? arrayRemove(currentChat.user.uid)
          : arrayUnion(currentChat.user.uid),
      });

      await updateDoc(userBlockedRef, {
        blockBy: isBlocked ? arrayRemove(auth.uid) : arrayUnion(auth.uid),
      });
    } catch (error) {
      console.error("Error blocking user", error);
    }
  }

  // scroll to bottom

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  const inputRef = useRef<HTMLInputElement>(null);

  // handle hit enter to send message

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSendMessage("Text");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Remove event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  return (
    <section className={cn("py-2 gap-3 w-full  grid grid-rows-10", className)}>
      {/* Info */}
      <div className="row-span-2  w-full  flex items-center justify-between border-slate-200 border-b py-2">
        {currentChat === null ? (
          <div className="flex  items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-2 w-[200px]" />
              <Skeleton className="h-2 w-[200px]" />
            </div>
          </div>
        ) : (
          <div className="flex w-full space-x-3">
            <img
              src={currentChat.user.photoURL}
              alt="Avatar"
              loading="lazy"
              className="rounded-full object-contain size-16"
            />
            <div className="w-full">
              <h4 className="text-lg font-semibold text-slate-800 dark:text-white">
                {currentChat.user.name}
              </h4>
              <p className="text-sm text-slate-400">{currentChat.user.email}</p>
            </div>
          </div>
        )}
        <div className="flex space-x-3">
          <Popover>
            <PopoverTrigger>
              <Button size="icon" variant="ghost">
                <EllipsisIcon className="size-6  stroke-blue-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40">
              <div className=" space-y-2">
                <div
                  className="flex items-center justify-around gap-2 cursor-pointer
                  hover:bg-gray-100 p-2 rounded-lg
                  "
                  onClick={() => {
                    if (isBlocked) {
                      handleBlockUser();
                      toast({
                        title: "Đã gỡ chặn người dùng này",
                      });
                    } else {
                      toast({
                        duration: 5000,
                        title: "Bạn có chắc chắn muốn chặn người dùng này?",
                        action: (
                          <ToastAction
                            className="text-red-500"
                            onClick={handleBlockUser}
                            altText="Chặn"
                          >
                            Chặn
                          </ToastAction>
                        ),
                      });
                    }
                  }}
                >
                  <p className="text-red-400">
                    {isBlocked ? "Gỡ chặn" : "Chặn"}
                  </p>
                  <ShieldMinusIcon className="size-5 stroke-orange-700" />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Container Chat */}
      <div className="w-full relative new-scroll row-span-8 h-[600px] overflow-y-auto px-3 space-y-2 py-2">
        {currentChat === null ? (
          <div className="flex justify-center items-center mt-12">
            <Loading />
          </div>
        ) : (
          <>
            {messages?.map((me, index) => (
              <div
                key={index}
                className={`flex py-1 items-center ${
                  me.sendBy === auth.uid ? "justify-end" : "justify-start"
                } ${
                  me.imageUrl && me.text === "Đã gửi ảnh"
                    ? "overflow-hidden space-x-3 "
                    : ""
                }`}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {me.imageUrl && me.text === "Đã gửi ảnh" ? (
                        <motion.img
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ scale: 1.1 }}
                          src={me.imageUrl}
                          alt="Image"
                          loading="lazy"
                          className="object-cover rounded-lg size-60"
                        />
                      ) : (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ x: 3 }}
                          className={`${
                            me.sendBy === currentChat.receiverId
                              ? "bg-gray-100 dark:text-black-200 "
                              : "bg-sky-200 text-black-200"
                          } px-2 rounded-xl max-w-xl break-words   text-wrap font-normal py-1 `}
                        >
                          {me.text}
                        </motion.p>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{calTime(me.sentAt as Timestamp)}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </>
        )}
        <div ref={ref} className="w-full h-0"></div>
      </div>

      {/* Input */}
      <div className="row-span-1 justify-center  flex items-center space-x-2 w-full ">
        <Button size="icon" variant="ghost" disabled={isDisabled}>
          <ImageIcon
            onClick={handleUploadImage}
            className="size-6 stroke-cyan-500"
          />
        </Button>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          name="image"
          accept="image/*"
          onChange={handleChangeImage}
        />

        <input
          className={clsx(
            "input rounded-full max-w-xl w-full px-4 py-2 border border-slate-300 focus:outline-none  placeholder:text-sm text-black-200 focus:border-blue-500 placeholder-gray-400 transition-all duration-300 shadow-md",
            {
              "text-red-400": isBlocked || isBeingBlocked,
              "border-red-600": isBlocked || isBeingBlocked,
            }
          )}
          placeholder="Type a message..."
          type="text"
          value={
            isBlocked
              ? "Người dùng này đã bị chặn"
              : isBeingBlocked
              ? "Bạn đã bị chặn"
              : text
          }
          disabled={isDisabled}
          onChange={(e) => setText(e.target.value)}
        />
        <Popover>
          <PopoverTrigger disabled={isDisabled}>
            <Button disabled={isDisabled} size="icon" variant="ghost">
              <SmileIcon className="size-6 stroke-blue-600" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverAnchor />
            <EmojiPicker
              onEmojiClick={(e) => {
                setText(text + e.emoji);
              }}
            />
          </PopoverContent>
        </Popover>

        <Button
          disabled={isDisabled}
          size="icon"
          variant="ghost"
          onClick={() => handleSendMessage("Text")}
        >
          {loading ? (
            <div className="flex-col gap-4 w-full flex items-center justify-center">
              <div className=" size-10 border-2 text-blue-400 text-4xl animate-spin border-gray-300 flex items-center justify-center border-t-blue-400 rounded-full">
                <MessageSquareIcon className="size-2 animate-ping" />
              </div>
            </div>
          ) : (
            <SendHorizonalIcon className="size-6 stroke-blue-500" />
          )}
        </Button>

        <Button
          onClick={handleLike}
          disabled={isDisabled}
          size="icon"
          variant="ghost"
        >
          <ThumbsUpIcon className="stroke-[#FFD225] cursor-pointer " />
        </Button>
      </div>
    </section>
  );
};

export default ChatDetails;
