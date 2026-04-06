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
import { Button } from "./ui/button";
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
    toast.success("Your issue has been reported successfully! We'll get back to you soon.", {
      description: `Issue type: ${data.issueType}`,
    });
  };

  return (
    <>
      <Card className={`min-h-[70vh] w-full min-w-full md:min-w-2xl ${className}`}>
        <>
          <CardHeader className='px-4 pt-6 sm:px-6'>
            <CardTitle className='text-xl font-extrabold'>Report a bug</CardTitle>
            <CardDescription className='text-base'>
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
                    {errors.email && (
                      <p className='text-sm text-red-500'>{errors.email.message}</p>
                    )}
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
                        required: "issue title required",
                        minLength: {
                          value: 5,
                          message: "Title must be at least 5 characters",
                        },
                      })}
                    />
                    {errors.issueTitle && (
                      <p className='text-sm text-red-500'>{errors.issueTitle.message}</p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Describe your Issue</FieldLabel>
                    <Input
                      type='text'
                      placeholder='describe your issue'
                      {...register("issueDescription", {
                        required: "description required",
                        minLength: {
                          value: 20,
                          message: "Description must be at least 20 characters",
                        },
                        maxLength: {
                          value: 200,
                          message: "Description cannot exceed 200 characters",
                        },
                      })}
                    />
                    {errors.issueDescription && (
                      <p className='text-sm text-red-500'>{errors.issueDescription.message}</p>
                    )}
                  </Field>
                </FieldGroup>
              </CardContent>
              <CardFooter className='px-4 pb-6 sm:px-6'>
                <FieldSet>
                  <Field orientation='horizontal' className='flex-wrap'>
                    <Button type='reset'>cancel</Button>
                    <Button
                      type='submit'
                      disabled={!isDirty || isSubmitting}>
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
