import cv2
import numpy as np

class VideoPolygonMask:
    def __init__(self, video_path, output_path="output_masked.mp4"):
        self.video_path = video_path
        self.output_path = output_path
        self.cap = cv2.VideoCapture(video_path)
        self.polygon_points = []
        self.current_polygon = []
        self.drawing = False
        
        # Store polygon for each frame
        self.frame_polygons = {}
        self.current_frame_num = 0
        
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
                # Save polygon for current frame
                self.frame_polygons[self.current_frame_num] = self.polygon_points.copy()
            self.current_polygon = []
            self.drawing = False
    
    def get_polygon_for_frame(self, frame_num):
        """Get the polygon for a specific frame (uses last defined polygon if not set)"""
        # Find the most recent polygon defined at or before this frame
        if frame_num in self.frame_polygons:
            return self.frame_polygons[frame_num]
        
        # Look backwards for the most recent polygon
        for f in range(frame_num, -1, -1):
            if f in self.frame_polygons:
                return self.frame_polygons[f]
        
        return None
    
    def apply_mask(self, frame, polygon, for_display=False):
        """Apply polygon mask to frame
        
        Args:
            frame: The input frame
            polygon: The polygon points
            for_display: If True, show semi-transparent background instead of black
        """
        if polygon is None or len(polygon) < 3:
            return frame
        
        # Create a black mask
        mask = np.zeros(frame.shape[:2], dtype=np.uint8)
        
        # Fill polygon with white
        pts = np.array(polygon, dtype=np.int32)
        cv2.fillPoly(mask, [pts], 255)
        
        if for_display:
            # Create semi-transparent version for display
            result = frame.copy()
            # Darken the area outside the polygon
            result[mask == 0] = (result[mask == 0] * 0.3).astype(np.uint8)
        else:
            # Create black background for saving
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
    
    def save_masked_video(self):
        """Save the entire video with mask applied"""
        if len(self.frame_polygons) == 0:
            print("No polygons defined. Video not saved.")
            return
        
        print("Saving masked video...")
        
        # Create a new capture for saving (to avoid conflicts)
        save_cap = cv2.VideoCapture(self.video_path)
        
        # Get video properties
        fps = save_cap.get(cv2.CAP_PROP_FPS)
        width = int(save_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(save_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(save_cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        print(f"Video info: {width}x{height} @ {fps} fps, {total_frames} frames")
        
        # Try different codecs in order of preference
        codecs = [
            ('avc1', '.mp4'),  # H.264
            ('mp4v', '.mp4'),  # MPEG-4
            ('XVID', '.avi'),  # Xvid
        ]
        
        out = None
        output_file = None
        
        for codec, ext in codecs:
            output_file = self.output_path.rsplit('.', 1)[0] + ext
            fourcc = cv2.VideoWriter_fourcc(*codec)
            out = cv2.VideoWriter(output_file, fourcc, fps, (width, height))
            
            if out.isOpened():
                print(f"Using codec: {codec}, output: {output_file}")
                break
            else:
                out.release()
                out = None
        
        if out is None or not out.isOpened():
            print("ERROR: Could not create video writer with any codec!")
            save_cap.release()
            return
        
        frame_count = 0
        while True:
            ret, frame = save_cap.read()
            if not ret:
                break
            
            # Get polygon for this frame and apply mask (black background for saving)
            polygon = self.get_polygon_for_frame(frame_count)
            masked_frame = self.apply_mask(frame, polygon, for_display=False)
            out.write(masked_frame)
            
            frame_count += 1
            if frame_count % 30 == 0:  # Progress update every 30 frames
                print(f"Processing: {frame_count}/{total_frames} frames")
        
        out.release()
        save_cap.release()
        print(f"Masked video saved to: {output_file}")
        print(f"Total polygons defined: {len(self.frame_polygons)} frames")
        print(f"Total frames written: {frame_count}")
    
    def run(self):
        """Main loop to process video"""
        if not self.cap.isOpened():
            print("Error: Could not open video file")
            return
        
        cv2.namedWindow('Video Polygon Mask')
        cv2.setMouseCallback('Video Polygon Mask', self.mouse_callback)
        
        print("Instructions:")
        print("- Left click to add polygon points")
        print("- Right click to finish polygon (saves for current frame)")
        print("- Press 'c' to clear polygon for current frame")
        print("- Press 'SPACE' to pause/resume")
        print("- Press 'r' to restart video")
        print("- Press 's' to skip ahead 1 second")
        print("- Press 'a' to go back 1 second")
        print("- Press 'd' to go forward 1 frame")
        print("- Press 'w' to go back 1 frame")
        print("- Press 'q' to quit and save masked video")
        print("- Press 'ESC' to quit without saving")
        
        # Get video FPS for skip calculation
        fps = self.cap.get(cv2.CAP_PROP_FPS)
        
        paused = False
        need_frame_update = True
        
        while True:
            # Read and process frame if not paused or if we need to update
            if not paused or need_frame_update:
                ret, frame = self.cap.read()
                
                if not ret:
                    # Loop video
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                
                # Update current frame number
                self.current_frame_num = int(self.cap.get(cv2.CAP_PROP_POS_FRAMES)) - 1
                
                # Get polygon for current frame
                current_poly = self.get_polygon_for_frame(self.current_frame_num)
                if current_poly is not None:
                    self.polygon_points = current_poly
                
                # Apply mask with semi-transparent background for display
                masked_frame = self.apply_mask(frame, self.polygon_points, for_display=True)
                
                # Draw polygon overlay
                display_frame = self.draw_polygon_overlay(masked_frame)
                
                # Add frame number to display
                cv2.putText(display_frame, f"Frame: {self.current_frame_num}", 
                           (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                
                # Reset the update flag
                need_frame_update = False
            
            cv2.imshow('Video Polygon Mask', display_frame)
            
            key = cv2.waitKey(30) & 0xFF
            
            if key == ord('q'):
                # Quit and save
                self.cap.release()
                cv2.destroyAllWindows()
                self.save_masked_video()
                break
            elif key == 27:  # ESC key
                # Quit without saving
                print("Exiting without saving.")
                break
            elif key == ord('c'):
                # Clear polygon for current frame
                if self.current_frame_num in self.frame_polygons:
                    del self.frame_polygons[self.current_frame_num]
                self.polygon_points = []
                self.current_polygon = []
                need_frame_update = True
            elif key == ord(' '):
                # Toggle pause
                paused = not paused
            #elif key == ord('r'):
            #    # Restart video
            #    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            elif key == ord('s'):
                # Skip ahead 1 second
                current_frame = self.cap.get(cv2.CAP_PROP_POS_FRAMES)
                new_frame = current_frame + fps
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, new_frame)
                need_frame_update = True
            elif key == ord('a'):
                # Go back 1 second
                current_frame = self.cap.get(cv2.CAP_PROP_POS_FRAMES)
                new_frame = max(0, current_frame - fps)
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, new_frame)
                need_frame_update = True
            elif key == ord('d'):
                # Go forward 1 frame
                current_frame = self.cap.get(cv2.CAP_PROP_POS_FRAMES)
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, current_frame + 1)
                need_frame_update = True
            elif key == ord('w'):
                # Go back 1 frame
                current_frame = self.cap.get(cv2.CAP_PROP_POS_FRAMES)
                new_frame = max(0, current_frame - 5)
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, new_frame)
                need_frame_update = True
        
        self.cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    # Replace with your video path
    video_path = "test.mov"
    output_path = "masked_output.mp4"
    
    masker = VideoPolygonMask(video_path, output_path)
    masker.run()
