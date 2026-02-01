type Props = {
    title: string;
    placeholder?: string;
    name: string;
};

export default function Input({title, placeholder, name} : Props) {
  return(
    <div>
    <label className="text-sm font-medium">{title}
    </label>
    <input
      name={name}
      className="mt-1 w-full border rounded-xl px-3 py-2"
      placeholder= {placeholder}
    />
  </div>
  )
}
