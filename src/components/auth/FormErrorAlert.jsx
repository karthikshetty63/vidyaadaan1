import Alert from "../ui/Alert";

// Error summary for multi-step forms. Individual fields also show their own message.
const FormErrorAlert = ({ messages = [], className = "" }) => {
  const list = (Array.isArray(messages) ? messages : [messages]).filter(Boolean);
  if (!list.length) return null;

  return (
    <Alert tone="danger" className={className} title={list.length > 1 ? "Please fix the following:" : undefined}>
      {list.length === 1 ? (
        list[0]
      ) : (
        <ul className="list-disc pl-5 space-y-0.5">
          {list.map((m) => <li key={m}>{m}</li>)}
        </ul>
      )}
    </Alert>
  );
};

export default FormErrorAlert;
