import { Container, Heading, IconButton } from "@chakra-ui/react";
import { List, ListItem } from "@chakra-ui/layout";
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
    if (currentPlaying === id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setCurrentPlaying(null);
      return;
    }

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
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Bgms List
      </Heading>

      {bgms.length > 0 && (
        <Heading size="md" pt={4} pl={10} pb={2}>
          {bgms[0].album}
        </Heading>
      )}

      <List spacing={10} pl={80} pt={2}>
        {bgms.map((bgm, idx) => {
          const isPlaying = currentPlaying === bgm.id;
          return (
            <ListItem key={idx} display="flex" alignItems="center">
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
                {isPlaying ? <FaStop /> : <FaPlay />}
              </IconButton>

              {bgm.title}
            </ListItem>
          );
        })}
      </List>

      {currentPlaying && (
        <div style={{ position: "relative", height: "100%" }}>
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
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
            }}
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </IconButton>
        </div>
      )}
    </Container>
  );
}
