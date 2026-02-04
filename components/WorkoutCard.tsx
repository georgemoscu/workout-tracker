import { Lucide } from "@react-native-vector-icons/lucide";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function WorkoutCard({ workout }: { workout: string }) {
  return (
    <View className="p-4 mb-4 rounded-lg bg-white shadow">
      <View className="flex-1 flex-row justify-between">
        <View className="flex-1 flex-row gap-x-2 items-center">
          <Lucide name="calendar" size={18} color="gray" />
          <Text>Fri, Jan 9</Text>
        </View>

        <View className="flex-row gap-x-4 items-center">
          <View className="flex-row items-center mt-1">
            <Lucide name="flame" size={18} color="#dc2626" />
            <Text className="text-red-600 font-bold">300</Text>
          </View>

          <View className="flex-row gap-x-1 items-center mt-1">
            <Lucide name="clock" size={18} color="#2563eb" />
            <Text className="text-blue-600 font-bold">48m</Text>
          </View>
        </View>
      </View>

      {/* Workout 1 */}
      <View className="my-1">
        <Text className="text-2xl font-bold mt-2 mb-2">{workout}</Text>

        <View className="flex-row justify-between">
          <Text className="text-xl">Bench Press</Text>
          <Text>4 sets @ 14KG</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xl">Push Ups</Text>
          <Text>3 sets @ 12 reps</Text>
        </View>
      </View>

      {/* Workout 2 */}
      <View className="my-1">
        <Text className="text-2xl font-bold mt-2 mb-2">Shoulders</Text>

        <View className="flex-row justify-between">
          <Text className="text-xl">Bench Press</Text>
          <Text>4 sets @ 14KG</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xl">Push Ups</Text>
          <Text>3 sets @ 12 reps</Text>
        </View>
      </View>

      {/* Separator */}
      <View className="border-b border-gray-200" />

      {/* Actions */}
      <View className="flex-row gap-x-2 -mb-4">
        <Link href={{ pathname: "/start-workout" }} asChild>
          <TouchableOpacity className="py-4 flex-1">
            <View className="flex-row justify-center items-center gap-x-2">
              <Lucide name="pencil" size={16} color="#2563eb" />
              <Text className="text-center text-blue-600 font-bold">Edit</Text>
            </View>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity className="py-4 flex-1">
          <View className="flex-row justify-center items-center gap-x-2">
            <Lucide name="trash-2" size={16} color="#dc2626" />
            <Text className="text-center text-red-600 font-bold">Remove</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
