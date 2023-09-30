"use client"
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {useRouter} from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const [user, setUser] = useState({email: "", password: "", username: ""});
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [loading, setLoading] = useState(false);

    const onLogin = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/login", user);
            console.log("Login success", response.data);
            toast.success("Login success");
            router.push("/profile");
        } catch (error:any) {
            console.log("Login failed", error.message);
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
            <div>
                <h1>Login</h1>
                <p>Email</p>
                <input id="email" type="text" value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} placeholder="email" />
                <p>Password</p>
                <input id="password" type="text" value={user.password} onChange={(e) => setUser({...user, password: e.target.value})} placeholder="password" />
                <button onClick={onLogin}>Login here</button>
                <a href="/signup">Visit signup</a>
            </div>
    )
}