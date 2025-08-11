import { Flex, Image, Text, useBreakpointValue } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";

import UserMenu from "./UserMenu";

function Navbar() {
  const display = useBreakpointValue({ base: "none", md: "flex" });

  return (
    <Flex
      display={display}
      justify="space-between"
      position="sticky"
      color="white"
      align="center"
      bg="bg.muted"
      w="100%"
      top={0}
      p={4}
    >
      <Link to="/">
        <Flex align="center">
          <Image
            src="/data/pokemon_images/AI_Porygon-Z.png"
            alt="ポリゴンZ"
            height="70px"
            maxW="2xs"
            alignSelf="center"
            mb={4}
          />
          <Text fontSize="2xl" fontWeight="bold" ml={4} color="black">
            ポケモンAI図鑑
          </Text>
        </Flex>
      </Link>
      <Flex gap={2} alignItems="center">
        <UserMenu />
      </Flex>
    </Flex>
  );
}

export default Navbar;
