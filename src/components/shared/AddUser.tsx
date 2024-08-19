import { useContext, useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "../ui/animated-modal";
import { IoIosAddCircleOutline as AddIcon } from "react-icons/io";
import { Input } from "../ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { db } from "@/lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  DocumentData,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { Button } from "../ui/button";
import { AuthContext } from "@/context/AuthContext";
import { useToast } from "../ui/use-toast";

const AddUser = () => {
  const [text, setText] = useState("");

  const searchText = useDebounce(text, 600);
  const [user, setUser] = useState<DocumentData[]>(null);

  const { auth } = useContext(AuthContext);

  useEffect(() => {
    async function fetchUser() {
      if (searchText.length > 1) {
        const userRef = collection(db, "users");
        const q = query(
          userRef,
          where("name", ">=", searchText),
          where("name", "<=", searchText + "\uf8ff")
        );
        const users = await getDocs(q);
        const matchingUsers = users.docs
          .map((doc) => doc.data())
          .filter((v) => v.uid !== auth?.uid);

        setUser(matchingUsers);
      } else {
        setUser(null);
      }
    }
    fetchUser();
  }, [searchText, auth]);

  const toast = useToast();

  const handleAddUser = async (userId: string) => {
    const chatRef = collection(db, "chats");
    const chatRoomRef = collection(db, "chatRooms");
    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
      await updateDoc(doc(chatRoomRef, userId), {
        chat: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: auth.uid,
          updatedAt: Date.now(),
        }),
      });
      await updateDoc(doc(chatRoomRef, auth.uid), {
        chat: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: userId,
          updatedAt: Date.now(),
        }),
      });
      toast.toast({
        title: "Thêm người dùng thành công",
      });
    } catch (err) {
      alert("Thêm người dùng thất bại");
      console.error(err);
    }
  };

  return (
    <Modal>
      <ModalTrigger>
        <AddIcon className="size-7  text-sky-500  font-bold cursor-pointer" />
      </ModalTrigger>
      <ModalBody>
        <ModalContent>
          <h3 className="mb-5 text-slate-500 dark:text-emerald-100 font-semibold tracking-wide">
            Thêm người dùng để trò chuyện
          </h3>

          <Input
            onChange={(e) => setText(e.target.value)}
            value={text}
            placeholder="Nhập kí tự đầu hoặc cả tên"
            className="max-w-md w-full"
          />
          <div className="flex items-center w-full flex-col space-y-4 mt-6">
            {user?.map((u) => (
              <div key={u.uid} className="flex w-full space-x-5 items-center">
                <img
                  src={u.photoURL}
                  alt="User"
                  className="rounded-full object-cover size-8"
                />
                <div className="space-y- inline-block overflow-hidden">
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-white">
                    {u.name}
                  </h4>
                  <p className="text-sm text-slate-400 truncate">{u.email}</p>
                </div>

                <Button onClick={() => handleAddUser(u.uid)}>Thêm</Button>
              </div>
            ))}
          </div>
        </ModalContent>
      </ModalBody>
    </Modal>
  );
};

export default AddUser;
