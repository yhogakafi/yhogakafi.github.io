import tkinter as tk

class InvertedColorOverlay(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Resizable Inverted Color Overlay")
        
        # Set the window to be always on top
        self.attributes('-topmost', True)
        
        # Set the default size of the window
        self.geometry("200x500")
        
        # Make the window resizable
        self.resizable(True, True)
        
        # Set the window color to black (which will be inverted to white)
        self.configure(bg='black')
        
        # Create a Canvas widget to draw the inverted color effect
        self.canvas = tk.Canvas(self, bg='black', highlightthickness=0)
        self.canvas.pack(fill=tk.BOTH, expand=True)
        
        # Draw an inverted color effect (black background with white text)
        self.draw_inverted_colors()

    def draw_inverted_colors(self):
        # Clear the canvas
        self.canvas.delete("all")
        
        # Draw a white rectangle covering the entire canvas
        self.canvas.create_rectangle(0, 0, self.winfo_width(), self.winfo_height(), fill='white', outline='white')
        
        # Optionally add some text with black color (for demonstration)
        self.canvas.create_text(self.winfo_width() / 2, self.winfo_height() / 2, text="Inverted Colors", fill='black', font=('Helvetica', 16))

if __name__ == "__main__":
    app = InvertedColorOverlay()
    app.mainloop()
