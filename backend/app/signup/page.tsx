"use client"
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {useRouter} from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function SignupPage() {
    const router = useRouter();
    const [user, setUser] = useState({email: "", password: "", username: ""});
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSignup = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/signup", user);
            console.log("Signup success", response.data);
            router.push("/login");
        } catch (error:any) {
            console.log("Signup failed", error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(user.email.length > 0 && user.password.length > 0 && user.username.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user]);

    return (
        loading ? <p>Loading...</p> :
        <div style={{color: "grey"}}>
            <h1>Signup</h1>
            <p>Username</p>
            <input id="username" type="text" value={user.username} onChange={(e) => setUser({...user, username: e.target.value})} placeholder="username" />
            <p>Email</p>
            <input id="email" type="text" value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} placeholder="email" />
            <p>Password</p>
            <input id="password" type="text" value={user.password} onChange={(e) => setUser({...user, password: e.target.value})} placeholder="password" />
            <button disabled={buttonDisabled} onClick={onSignup}>Signup here</button>
            <a href="/login">Visit login</a>
        </div>
    )
}