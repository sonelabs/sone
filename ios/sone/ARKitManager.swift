import ARKit

@objc(ARKitManager)
class ARKitManager: NSObject, ARSessionDelegate {
    private var session: ARSession?
    private var eyeGazeCallback: RCTResponseSenderBlock?

    @objc func startEyeTracking(_ callback: @escaping RCTResponseSenderBlock) {
        guard ARFaceTrackingConfiguration.isSupported else {
            print("Face Tracking not supported on this device.")
            return
        }

        let configuration = ARFaceTrackingConfiguration()
        configuration.isLightEstimationEnabled = true

        session = ARSession()
        session?.delegate = self
        session?.run(configuration)
        eyeGazeCallback = callback
    }

    func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        guard let faceAnchor = anchors.first as? ARFaceAnchor else { return }
        let leftEye = faceAnchor.leftEyeTransform
        let rightEye = faceAnchor.rightEyeTransform

        // Average the gaze vectors
        let gazeDirection = simd_make_float3(leftEye.columns.2 + rightEye.columns.2) / 2
        let gazeData: [String: Float] = [
            "x": gazeDirection.x,
            "y": gazeDirection.y,
            "z": gazeDirection.z
        ]
        eyeGazeCallback?([gazeData])
    }
}
