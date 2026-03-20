import { useForm, Controller } from "react-hook-form";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/Button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "./ui/input-group";
import { Input } from "./ui/input";
import {
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
  Field,
  FieldSeparator,
} from "./ui/field";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const SupportForm = ({ className }) => {
  const {
    handleSubmit,
    register,
    control,
    formState: { isDirty, errors, isSubmitting },
  } = useForm({
    defaultValues: {
      // firstName: "",
      // lastName: "",
      issueTitle: "",
      issueType: "",
      email: "",
      issueDescription: "",
    },
  });

  const submitHandler = (data) => {
    console.log("data submitted:", data);
  };

  return (
    <>
      <Card className={`min-h-[70vh] min-w-2xl ${className}`}>
        <>
          <CardHeader>
            <CardTitle>Report a bug</CardTitle>
            <CardDescription>
              Please help us improve our site by reporting your case
            </CardDescription>
          </CardHeader>
          {errors.root ?? undefined}
          <form
            onSubmit={handleSubmit(submitHandler, (errors) => {
              console.info("Errors", errors);
            })}>
            <FieldGroup>
              <CardContent>
                <FieldGroup>
                  {/* <div className='flex gap-10'>
                  <Field>
                    <FieldLabel>First Name</FieldLabel>
                    <Input
                      type='text'
                      placeholder='john'
                      {...register("firstName", { required: "name required" })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Last Name</FieldLabel>
                    <Input
                      type='text'
                      placeholder='doe'
                      {...register("lastName", { required: true })}
                    />
                  </Field>
                </div> */}
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      type='email'
                      placeholder='john@doe.com'
                      {...register("email", {
                        required: "email required",
                        pattern: {
                          value: /^\S+@\S+$/,
                          message: "Invalid email",
                        },
                      })}
                    />
                  </Field>
                  <Controller
                    name='issueType'
                    control={control}
                    rules={{ required: "Issue type is required" }}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>Issue type</FieldLabel>

                        <Select
                          value={field.value}
                          onValueChange={field.onChange}>
                          <SelectTrigger
                            className={
                              fieldState.error
                                ? "border-red-500 focus:ring-red-500"
                                : ""
                            }>
                            <SelectValue placeholder='issue type' />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value='ios app'>iOS App</SelectItem>
                              <SelectItem value='android app'>
                                Android App
                              </SelectItem>
                              <SelectItem value='web dashboard'>
                                Web Dashboard
                              </SelectItem>
                              <SelectItem value='other'>Other</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>

                        {fieldState.error && (
                          <p className='text-sm text-red-500'>
                            {fieldState.error.message}
                          </p>
                        )}
                      </Field>
                    )}
                  />

                  <Field>
                    <FieldLabel>Issue title</FieldLabel>
                    <Input
                      type='text'
                      placeholder='enter title'
                      {...register("issueTitle", {
                        required: true,
                        minLength: 5,
                      })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Describe your Issue</FieldLabel>
                    <Input
                      type='text'
                      placeholder='describe your issue'
                      {...register("issueDescription", {
                        required: true,
                        minLength: 20,
                        maxLength: 200,
                      })}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
              <CardFooter>
                <FieldSet>
                  <Field orientation='horizontal'>
                    <Button type='reset'>cancel</Button>
                    <Button
                      type='submit'
                      disabled={!isDirty || isSubmitting}
                      onClick={() => toast("event created")}>
                      Submit
                    </Button>
                  </Field>
                </FieldSet>
              </CardFooter>
            </FieldGroup>
          </form>
        </>
        <div></div>
      </Card>
    </>
  );
};

export default SupportForm;
