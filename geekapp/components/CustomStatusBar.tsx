import React from 'react';
import { StatusBar, StatusBarProps, Platform, View } from 'react-native';

interface CustomStatusBarProps extends StatusBarProps {
  backgroundColor?: string;
}

const CustomStatusBar: React.FC<CustomStatusBarProps> = ({ 
  backgroundColor = '#FAFAFA', 
  barStyle = 'dark-content',
  ...props 
}) => {
  return (
    <>
      <StatusBar
        barStyle={barStyle}
        backgroundColor={backgroundColor}
        translucent={true}
        {...props}
      />
      {Platform.OS === 'android' && (
        <View style={{ 
          height: StatusBar.currentHeight,
          backgroundColor: backgroundColor 
        }} />
      )}
    </>
  );
};

export default CustomStatusBar;