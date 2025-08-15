import { Container, Heading, IconButton, Box } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { FaPlay, FaStop, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

// @ts-ignore
export const Route = createFileRoute("/_layout/bgms")({
  component: Bgms,
});

interface Bgm {
  album: string;
  title: string;
  file_path: string;
  id: string;
}

function Bgms() {
  const [bgms, setBgms] = useState<Bgm[]>([]);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/bgms")
      .then((res) => res.json())
      .then((data) => {
        setBgms(data);
      });
  }, []);

  const playAudio = (filePath: string, id: string) => {
    // 同じ曲なら停止
    if (currentPlaying === id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setCurrentPlaying(null);
      return;
    }

    // 別曲再生前に既存停止
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(filePath);
    audio.volume = isMuted ? 0 : volume;
    audio.play();
    audioRef.current = audio;
    setCurrentPlaying(id);

    audio.onended = () => {
      const currentIndex = bgms.findIndex((bgm) => bgm.id === id);
      const nextIndex = (currentIndex + 1) % bgms.length;
      const nextBgm = bgms[nextIndex];
      playAudio(
        `/data/BGM/PokemonRG_Music/${encodeURIComponent(nextBgm.title)}.wav`,
        nextBgm.id
      );
    };
  };

  return (
    <>
      <Container maxW="full">
        <Heading size="lg" pt={12}>
          Bgms List
        </Heading>

        {bgms.length > 0 && (
          <Heading size="md" pt={4} pl={10} pb={2}>
            {bgms[0].album}
          </Heading>
        )}

        <Box
          as="ul"
          pl={59}
          pt={2}
          display="grid"
          rowGap={3}
          listStyleType="none"
          m={0}
        >
          {bgms.map((bgm) => {
            const isPlaying = currentPlaying === bgm.id;
            return (
              <Box
                as="li"
                key={bgm.id}
                display="flex"
                alignItems="center"
                fontSize="sm"
              >
                <IconButton
                  aria-label={isPlaying ? "Stop" : "Play"}
                  onClick={() =>
                    playAudio(
                      `/data/BGM/PokemonRG_Music/${encodeURIComponent(bgm.title)}.wav`,
                      bgm.id
                    )
                  }
                  mr={2}
                  size="xs"
                  colorScheme={isPlaying ? "red" : "gray"}
                >
                  <Box as="span">{isPlaying ? <FaStop /> : <FaPlay />}</Box>
                </IconButton>
                {bgm.title}
              </Box>
            );
          })}
        </Box>
      </Container>

      {currentPlaying && (
        <Box
          position="fixed"
          bottom="20px"
          left="20px"
          zIndex={1000}
          display="flex"
          gap={2}
          alignItems="center"
          bg="white"
          _dark={{ bg: "gray.700" }}
          p={2}
          borderRadius="md"
          boxShadow="md"
        >
          <IconButton
            aria-label="Mute toggle"
            size="xs"
            variant="ghost"
            onClick={() => {
              setIsMuted(!isMuted);
              if (audioRef.current) {
                audioRef.current.muted = !isMuted;
              }
            }}
          >
            <Box as="span">{isMuted ? <FaVolumeMute /> : <FaVolumeUp />}</Box>
          </IconButton>
        </Box>
      )}
    </>
  );
}
