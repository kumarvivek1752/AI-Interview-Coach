import { useEffect, useRef } from "react";


const Camera = () => {

    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const captureCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: {width: 1920, height: 1080} })
                
                if(videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch(err) {
                console.error("Error capturing video: ", err);
            }
        }

        captureCamera();
    }, [])

    return (
        <video ref={videoRef} autoPlay/>
    );
};

export default Camera;
