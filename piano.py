import cv2
import numpy as np

class VideoPolygonMask:
    def __init__(self, video_path):
        self.video_path = video_path
        self.cap = cv2.VideoCapture(video_path)
        self.polygon_points = []
        self.current_polygon = []
        self.drawing = False
        
    def mouse_callback(self, event, x, y, flags, param):
        """Handle mouse events for drawing polygon"""
        if event == cv2.EVENT_LBUTTONDOWN:
            # Add point to current polygon
            self.current_polygon.append([x, y])
            self.drawing = True
            
        elif event == cv2.EVENT_RBUTTONDOWN:
            # Finish polygon (right click)
            if len(self.current_polygon) >= 3:
                self.polygon_points = self.current_polygon.copy()
            self.current_polygon = []
            self.drawing = False
    
    def apply_mask(self, frame):
        """Apply polygon mask to frame"""
        if len(self.polygon_points) < 3:
            return frame
        
        # Create a black mask
        mask = np.zeros(frame.shape[:2], dtype=np.uint8)
        
        # Fill polygon with white
        pts = np.array(self.polygon_points, dtype=np.int32)
        cv2.fillPoly(mask, [pts], 255)
        
        # Create black background
        result = np.zeros_like(frame)
        
        # Copy only the polygon area
        result[mask == 255] = frame[mask == 255]
        
        return result
    
    def draw_polygon_overlay(self, frame):
        """Draw the current polygon on the frame"""
        overlay = frame.copy()
        
        # Draw current polygon being drawn
        if len(self.current_polygon) > 0:
            for i, pt in enumerate(self.current_polygon):
                cv2.circle(overlay, tuple(pt), 5, (0, 255, 0), -1)
                if i > 0:
                    cv2.line(overlay, tuple(self.current_polygon[i-1]), 
                            tuple(pt), (0, 255, 0), 2)
        
        # Draw finalized polygon
        if len(self.polygon_points) >= 3:
            pts = np.array(self.polygon_points, dtype=np.int32)
            cv2.polylines(overlay, [pts], True, (0, 0, 255), 2)
            for pt in self.polygon_points:
                cv2.circle(overlay, tuple(pt), 5, (0, 0, 255), -1)
        
        return overlay
    
    def run(self):
        """Main loop to process video"""
        if not self.cap.isOpened():
            print("Error: Could not open video file")
            return
        
        cv2.namedWindow('Video Polygon Mask')
        cv2.setMouseCallback('Video Polygon Mask', self.mouse_callback)
        
        print("Instructions:")
        print("- Left click to add polygon points")
        print("- Right click to finish polygon")
        print("- Press 'c' to clear polygon")
        print("- Press 'SPACE' to pause/resume")
        print("- Press 'r' to restart video")
        print("- Press 'q' to quit")
        
        paused = False
        
        while True:
            if not paused:
                ret, frame = self.cap.read()
                
                if not ret:
                    # Loop video
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                
                # Apply mask
                masked_frame = self.apply_mask(frame)
                
                # Draw polygon overlay
                display_frame = self.draw_polygon_overlay(masked_frame)
            
            cv2.imshow('Video Polygon Mask', display_frame)
            
            key = cv2.waitKey(30) & 0xFF
            
            if key == ord('q'):
                break
            elif key == ord('c'):
                # Clear polygon
                self.polygon_points = []
                self.current_polygon = []
            elif key == ord(' '):
                # Toggle pause
                paused = not paused
            elif key == ord('r'):
                # Restart video
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        
        self.cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    # Replace with your video path
    video_path = "your_video.mp4"
    
    masker = VideoPolygonMask(video_path)
    masker.run()
