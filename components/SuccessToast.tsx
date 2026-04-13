import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SuccessToastProps {
  visible: boolean;
  message?: string;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({ visible, message = '添加成功！' }) => {
  const [show, setShow] = useState(false);
  const [key, setKey] = useState(0); // 用于强制重新渲染

  useEffect(() => {
    console.log('SuccessToast received visible prop:', visible, 'key:', key);
    if (visible) {
      console.log('SuccessToast triggered - setting show to true');
      setShow(true);
      
      // 2.5秒后自动隐藏
      const timer = setTimeout(() => {
        console.log('SuccessToast hiding');
        setShow(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible, key]); // 添加 key 依赖

  console.log('SuccessToast rendering, show:', show);

  if (!show) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
});
