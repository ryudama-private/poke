import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
  Image,
} from "@chakra-ui/react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GiBrain } from "react-icons/gi";

// @ts-ignore
export const Route = createFileRoute("/_layout/chat")({
  component: ChatPage,
});

interface Message {
  id: string;
  text: string;
  ts: number;
  role: "user" | "AI";
}

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      text: "Welcome to Chat Room.",
      ts: Date.now(),
      role: "AI",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const msg: Message = {
        id: crypto.randomUUID(),
        text: trimmed,
        ts: Date.now(),
        role: "user",
      };
      setMessages((prev) => [...prev, msg]);
      setInput("");
      setIsLoading(true);

      // バックエンドAPIを呼び出す
      fetch("https://pokedex-back.azurewebsites.net/api/v1/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Server responded with status ${res.status}`);
          }
          return res.json();
        })
        .then((data: { message: string }) => {
          // AIからの返信をメッセージリストに追加
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              text: data.message,
              ts: Date.now(),
              role: "AI",
            },
          ]);
        })
        .catch((err) => {
          // エラーメッセージをチャットに表示
          console.error(err);
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              text: "Sorry, an error occurred. Please try again.",
              ts: Date.now(),
              role: "AI",
            },
          ]);
        })
        .finally(() => {
          setIsLoading(false); // ローディング終了
        });
    },
    [input]
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Heading size="lg" mb={4}>
        Chat Room
      </Heading>

      <Box
        ref={listRef}
        borderWidth="1px"
        borderRadius="md"
        p={3}
        h="55vh"
        overflowY="auto"
        bg="gray.50"
        _dark={{ bg: "gray.800" }}
        mb={4}
      >
        <VStack align="stretch">
          {messages.map((m) => {
            const isUser = m.role === "user";
            const bubbleBg = isUser ? "green.400" : "white";
            const bubbleBgDark = isUser ? "green.500" : "gray.700";
            const timeStr = new Date(m.ts).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <HStack
                key={m.id}
                justify={isUser ? "flex-end" : "flex-start"}
                align="flex-start"
              >
                {!isUser && <GiBrain size="28px" />}

                {isUser && (
                  <Text
                    fontSize="10px"
                    color="gray.500"
                    whiteSpace="nowrap"
                    alignSelf="flex-end"
                    pb="2px"
                  >
                    {timeStr}
                  </Text>
                )}

                <Box
                  maxW="80%"
                  alignSelf="flex-start"
                  bg={bubbleBg}
                  color="black"
                  _dark={{ bg: bubbleBgDark, color: "white" }}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  boxShadow="sm"
                  position="relative"
                  _before={
                    !isUser
                      ? {
                          content: '""',
                          position: "absolute",
                          left: "-6px",
                          top: "14px",
                          width: 0,
                          height: 0,
                          borderTop: "6px solid transparent",
                          borderBottom: "6px solid transparent",
                          borderRight: "6px solid",
                          borderRightColor: bubbleBg,
                          _dark: { borderRightColor: bubbleBgDark },
                        }
                      : undefined
                  }
                >
                  <Text fontSize="sm" whiteSpace="pre-wrap">
                    {m.text}
                  </Text>
                </Box>

                {!isUser && (
                  <Text
                    fontSize="10px"
                    color="gray.500"
                    whiteSpace="nowrap"
                    alignSelf="flex-end"
                    pb="2px"
                  >
                    {timeStr}
                  </Text>
                )}
              </HStack>
            );
          })}{" "}
        </VStack>{" "}
      </Box>

      <Box as="form" onSubmit={onSubmit}>
        <HStack>
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            disabled={isLoading}
          />
          <Button type="submit" colorScheme="blue">
            Send
          </Button>
        </HStack>
      </Box>
    </Container>
  );
}

export default ChatPage;
