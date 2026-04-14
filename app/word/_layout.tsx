import { Stack } from 'expo-router';

export default function WordLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[word]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
