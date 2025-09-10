"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { FOOD_OPTIONS, PRESENCE_OPTIONS } from "@/consts/form";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Loader2Icon } from "lucide-react";

const NAMES = "Имена и Фамилии";
const PRESENCE = "Присутствие";
const FOOD = "Выбор по еде";
const ALCOHOL = "Выбор по алкоголю";

const alcoholOptions = [
  "Игристое",
  "Вино белое",
  "Вино красное",
  "Виски",
  "Коньяк",
  "Водка",
  "Настойки",
  "Что-то безалкогольное",
];

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Необходимо заполнить перед отправкой ответа",
  }),
  presence: z.enum(["be", "notBe"]),
  food: z.enum(["fish", "meat"]),
  alcohol: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Необходимо выбрать хотя бы один вариант",
  }),
});

export const MainForm = () => {
  const initDataUser = useSignal(initData.user);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAdding, setIsLoadingAdding] = useState(false);
  const [isSubmited, setIsSubmited] = useLocalStorage("isSubmited", false);

  const register = (chatId: number) => {
    if (!isLoading) {
      setIsLoading(true);
      fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chat_id: chatId }),
      }).then(() => {
        setIsRegistered(true);
        setIsLoading(false);
      });
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isLoadingAdding) {
      setIsLoadingAdding(true);
      fetch("/api/sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [NAMES]: values.username,
          [PRESENCE]: PRESENCE_OPTIONS[values.presence],
          [FOOD]: FOOD_OPTIONS[values.food],
          [ALCOHOL]: values.alcohol.join(" | "),
        }),
      }).then((res) => {
        setIsSubmited(true);
        setIsLoadingAdding(false);
      });
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      food: "fish",
      presence: "be",
      alcohol: [],
    },
  });

  useEffect(() => {
    if (initDataUser?.id && !isRegistered) {
      register(initDataUser?.id);
    }
  }, [isRegistered, initDataUser]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-center gap-8"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Данные гостя</FormLabel>
              <FormControl>
                <Input placeholder="Иванов Иван" {...field} />
              </FormControl>
              <FormDescription>Напишите ваше фамилию и имя</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="presence"
          render={({ field }) => (
            <FormItem className="space-y-3 w-full">
              <FormLabel>Подтвердите свое присутствие:</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col"
                >
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem value="be" />
                    </FormControl>
                    <FormLabel className="font-normal">Я приду</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem value="notBe" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      К сожалению, меня не будет
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="food"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>
                Выберите блюдо, которое вы хотели бы видеть в день свадьбы в
                качестве горячего:
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col"
                >
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem value="fish" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Филе лосося с овощами гриль и соусом Белое вино
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem value="meat" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Филе-миньон с картофелем Пушкин и соусом Белые грибы
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alcohol"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>
                  Для составления алкогольной карты, нам помогут ваши
                  предпочтения по напиткам:
                </FormLabel>
                <FormDescription>
                  Выберите один или несколько напитков
                </FormDescription>
              </div>
              {alcoholOptions.map((option, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name="alcohol"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={index}
                        className="flex flex-row items-center gap-2"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, option])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== option
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {option}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />

        {!isSubmited && (
          <Button type="submit" disabled={isLoading}>
            {isLoadingAdding ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              "Отправить ответ"
            )}
          </Button>
        )}
        {isSubmited && <p>Спасибо, что заполнили анкету</p>}
        {/* {isSubmited && (
          <Button
            onClick={() => {
              setIsSubmited(false);
            }}
          >
            Reset
          </Button>
        )} */}
      </form>
    </Form>
  );
};
