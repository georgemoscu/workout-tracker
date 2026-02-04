import { muscleGroups } from "@/consts/muschels";
import { ScrollView, Text, TouchableOpacity } from "react-native";

export default function ExerciseForm() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {muscleGroups.map((group, index) => (
        <TouchableOpacity key={group}>
          <Text
            key={index}
            className={"bg-gray-200 rounded-md px-3 py-2 h-10 text-center"}
          >
            {group}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
