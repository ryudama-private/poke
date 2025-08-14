import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

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
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return; // 空は無視
    const msg: Message = {
      id: crypto.randomUUID(),
      text: trimmed,
      ts: Date.now(),
      role: "user",
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");

    // 簡易エコー応答
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: `${msg.text}`,
          ts: Date.now(),
          role: "AI",
        },
      ]);
    }, 400);
  }, []);

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
          {messages.map((m) => (
            <Box
              key={m.id}
              maxW="80%"
              alignSelf={m.role === "user" ? "flex-end" : "flex-start"}
              bg={m.role === "user" ? "blue.500" : "gray.300"}
              color={m.role === "user" ? "white" : "black"}
              _dark={{
                bg: m.role === "user" ? "blue.400" : "gray.600",
                color: "white",
              }}
              px={3}
              py={2}
              borderRadius="lg"
              boxShadow="sm"
            >
              <Text fontSize="sm" whiteSpace="pre-wrap">
                {m.text}
              </Text>
              <Text fontSize="10px" opacity={0.6} mt={1} textAlign="right">
                {new Date(m.ts).toLocaleTimeString()}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>

      <Box as="form" onSubmit={onSubmit}>
        <HStack>
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
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
