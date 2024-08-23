import { useContext } from "react";
import { motion } from "framer-motion";
import AnimatedGradientText from "../ui/AnimatedGradientText";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "../ui/animated-modal";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookSquare } from "react-icons/fa";

import { Button } from "../ui/button";
import { getAuth, signInWithPopup, User } from "firebase/auth";
import { db, facebookProvider, googleProvider } from "@/lib/firebase";
import { AuthContext } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

const LoginHandler = ({ className }: { className?: string }) => {
  const loginTrigger = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      animate={{ opacity: 1, scale: 1 }}
      initial={{ opacity: 0, scale: 0.9 }}
      className={cn(
        " z-10 cursor-pointer flex  items-center justify-center",
        className
      )}
    >
      <AnimatedGradientText className="bg-transparent ">
        <span
          className={cn(
            `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent text-lg tracking-tight`
          )}
        >
          Đăng nhập ngay
        </span>
        <ChevronRightIcon className="ml-1 size-5   stroke-sky-300 animate-out transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
      </AnimatedGradientText>
    </motion.div>
  );

  type Provider = "google" | "facebook";

  // get auth context

  const { handleSetAuth } = useContext(AuthContext);

  // define navigate and location
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/auth";

  // create new user to database

  async function createUser(auth: User) {
    // check if user is already in the database
    const userRef = collection(db, "users");

    const q = query(userRef, where("uid", "==", auth.uid));

    const user = await getDocs(q);

    if (!user.empty) {
      return;
    }

    await setDoc(doc(db, "users", auth.uid), {
      uid: auth.uid,
      email: auth.email,
      name: auth.displayName,
      photoURL: auth.photoURL,
      blockList: [],
      blockBy: [],
    });

    // if not create a new user
  }

  async function createChatRoom(auth: User) {
    // check if chat room is already in the database

    const docRef = doc(db, "chatRooms", auth.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return;
    } else {
      await setDoc(doc(db, "chatRooms", auth.uid), {
        chat: [],
      });
    }
  }

  // function  to handle login
  const handleLogin = async (type: Provider) => {
    const auth = getAuth();

    const provider = type === "google" ? googleProvider : facebookProvider;

    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;

        handleSetAuth(user);
        createUser(user);
        createChatRoom(user);

        // navigate to the previous location or to the auth page
        navigate(from, { replace: true });
      })
      .catch((e) => {
        console.log(e);
        alert("Đăng nhập thất bại" + " " + e.message);
      });
  };
  return (
    <Modal>
      <ModalTrigger>{loginTrigger}</ModalTrigger>
      <ModalBody>
        <ModalContent className="border-black-200">
          <h3 className="text-2xl tracking-wide text-gray-800 dark:text-gray-100">
            Chọn phương thức đăng nhập
          </h3>
          <div className="mt-10 space-y-5">
            <Button
              onClick={() => handleLogin("google")}
              variant="outline"
              className="rounded-xl flex  min-w-[260px]  items-center justify-around"
            >
              <FcGoogle className="size-6 mr-2" />
              <span className="tracking-tight font-normal">
                Đăng nhập với Google
              </span>
            </Button>
            <Button
              onClick={() => handleLogin("facebook")}
              variant="outline"
              className="rounded-xl flex min-w-[260px]  items-center justify-around"
            >
              <FaFacebookSquare className="size-6 mr-2 text-blue-500" />
              <span className="tracking-tight font-normal">
                Đăng nhập với Facebook
              </span>
            </Button>
          </div>
        </ModalContent>
      </ModalBody>
    </Modal>
  );
};

export default LoginHandler;
