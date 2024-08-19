declare type User = {
  name: string;
  uid: string;
  email: string;
  photoURL: string;
};

declare type ChatRoom = {
  chatId: string;
  receiverId: string;
  updatedAt: number;
  lastMessage: string;
  user: User;
  isSeen: boolean;
};

declare type ChatRooms = ChatRoom[];

declare type Message = {
  sendBy: string;
  text: string;
  imageUrl: string;
  sentAt: unknown;
};

declare type Messages = Message[];
