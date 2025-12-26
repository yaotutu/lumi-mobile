import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ScreenWrapper } from '@/components/screen-wrapper';

export default function ProfileScreen() {
  return (
    <ScreenWrapper>
      <View style={styles.content}>
        <ThemedText type="title">我的</ThemedText>
        <ThemedText style={styles.subtitle}>此页面即将推出</ThemedText>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.6,
  },
});
