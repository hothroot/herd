"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

import { type Address, type Reps } from '@/scripts/letter-state.js';
import profileRef from '../../assets/profile.png';

import React, { useRef, useState } from "react";

const today = new Date().toLocaleString('default', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

type Props = {
    address: Address,
    reps: Reps,
};



export default function Draft(props: Props) {
    const address = props.address;
    const reps = props.reps;

    const headshot = useRef<HTMLImageElement>(null);
    const uploadInput = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [headshotData, setHeadshotData] = useState("");
    const [headshotSource, setheadshotSource] = useState(profileRef.src);

    function handleSubmit() {
        setIsSubmitting(true);
    }

    function initiateUpload() {
        if (uploadInput.current) {
            uploadInput.current.click();
        }
    }

    function scaleHeadshot() {
        if (headshot.current) {
            // resize into a canvas incase it is large
            const canvas = new OffscreenCanvas(headshot.current.clientWidth * 2, headshot.current.clientHeight * 2);
            const context = canvas.getContext('2d');
            context?.drawImage(headshot.current, 0, 0, canvas.width, canvas.height);
            canvas.convertToBlob({ type: 'image/jpg', quality: 0.9 })
            .then(blob => {
                const canvasReader = new FileReader();
                canvasReader.onloadend = function() {
                    // store as a data url for uploading in the
                    if (typeof canvasReader.result === "string") {
                        setHeadshotData(canvasReader.result);
                    }
                };
                canvasReader.readAsDataURL(blob);
            });
        }
    }

    function processImage(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(readerEvent) {
                if (headshot.current && readerEvent.target && typeof readerEvent.target.result === "string") {
                    headshot.current.onload = scaleHeadshot;
                    setheadshotSource(readerEvent.target.result);
                }
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    return (
        <form method="POST" action="/letter" onSubmit={handleSubmit}>
            <div className="flow-root">
                <div className="w-2/3 md:w-1/3 md:float-right">
                    <i>
                        from:
                    </i>
                    <p>
                        {address.name} <br />
                        {address.street} <br />
                        {address.city}, {address.state} {address.zipcode}
                    </p>
                </div>
            </div>
            <div className="flow-root">
                <div className="w-2/3 md:w-1/2 md:float-left">
                    <div className="flex flex-row">
                        {reps.map((rep: { [x: string]: string; }) =>
                            <img className="w-1/3 m-1" src={rep['photoURL']} alt={rep['name']} key={rep['name']}/>
                        )}
                    </div>
                    <p>
                        {today}
                    </p>
                    {reps.map((rep: { [x: string]: string; }) =>
                        <p className="m-0" key={rep['name']}>
                            The Honorable {rep['name']},
                        </p>
                    )}
                </div>
            </div>
            <div className="grid w-full gap-2 h-48">
                <Textarea id="message" name="message"
                    placeholder="On this occasion, I write to you on a topic of grave importance." />
            </div>
            <div className="flow-root">
                <div className="w-2/3 md:w-1/2 md:float-right">
                    <div className="flex md:flex-row flex-col">
                        <img className="w-1/3 rounded-md m-2"
                             id="headshot"
                             alt="your photo here"
                             src={headshotSource}
                             ref={headshot}/>
                    </div>
                    <p>
                    <input className="hidden"
                            type="file"
                            id="image-upload" name="image-upload"
                            accept="image/png, image/jpeg"
                            ref={uploadInput}
                            onChange={processImage}/>
                    <Button type="button"
                            id="image-upload-button"
                            onClick={initiateUpload}
                            >
                        Choose Photo
                    </Button>
                    </p>
                    <p>
                        Sincerely yours,
                    </p>
                    <p>
                        {address.name}
                    </p>
                    <Button type="submit" disabled={isSubmitting} className="flex items-center justify-center px-4 py-2">
                        {isSubmitting && (
                            <svg className={"animate-spin h-4 w-4 text-white"} viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        )}
                        {!isSubmitting && (
                            <span> Submit </span>
                        )}
                    </Button>
                    <input type="hidden" id="name" name="name" value={address.name} />
                    <input type="hidden" id="street" name="street" value={address.street} />
                    <input type="hidden" id="city" name="city" value={address.city} />
                    <input type="hidden" id="state" name="state" value={address.state} />
                    <input type="hidden" id="zipcode" name="zipcode" value={address.zipcode} />
                    <input type="hidden" id="today" name="today" value={today} />
                    <input type="hidden" id="headshot-data" name="headshot-data" value={headshotData} />
                    {reps.map((rep: { [x: string]: string; }, i: number) =>
                        <input type="hidden" id={"senator" + i} name={"senator" + i} value={rep['name']} key={rep['name']}/>
                    )}
                    {reps.map((rep: { [x: string]: string; }, i: number) =>
                        <input type="hidden" id={"office" + i} name={"office" + i} value={rep['street']} key={"office" + i}/>
                    )}
                </div>
            </div>
        </form>
    );
}