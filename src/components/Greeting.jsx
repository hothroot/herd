import { useState} from "react"
import { Button } from "@/components/ui/button"

export default function Greeting({messages}) {

  const randomMessage = () => messages[(Math.floor(Math.random() * messages.length))];

  const [greeting, setGreeting] = useState(messages[0]);

  return (
    <div>
      <h3>{greeting}! Thank you for visiting!</h3>
      <Button variant="outline" onClick={() => setGreeting(randomMessage())}>
        New Greeting
      </Button>
    </div>
  );
}