export type Address = {   
    name: string;
    street: string;
    city: string;
    state: string;
    zipcode: string;
}; 
export type Rep = {
    id: string;
    fullName: string;
    salutation: string;
    photoURL: string;
    state: string;
    office: string;
};
export type Reps = Array<Rep>;
export type Envelope = {
    address: Address;
    reps: Reps;
    signature: string;
} | null;
