
import React from 'react';
import { StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';


interface SplashVideoProps {
  onFinish: () => void;
}

const SplashVideo: React.FC<SplashVideoProps> = ({ onFinish }) => {
  return (
    <Video
      style={StyleSheet.absoluteFill}
      resizeMode={ResizeMode.COVER}
      source={require('../assets/images/brand.mp4')}
      onPlaybackStatusUpdate={(status) => {
        if (status.isLoaded && status.didJustFinish) {
          onFinish();
        }
      }}
      shouldPlay
      isLooping={false}
    />
  );
};

export default SplashVideo;
