function checkLineIntersection(ray, block) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point

	var line1StartX = ray.origin.x;
	var line1StartY = ray.origin.y;
	var line1EndX = ray.origin.x + ray.vector.x;
	var line1EndY = ray.origin.y + ray.vector.y;

	var line2StartX = block.origin.x;
	var line2StartY = block.origin.y;
	var line2EndX = line2StartX + block.vector.x;
	var line2EndY = line2StartY + block.vector.y;

    var denominator, a, b, numerator1, numerator2;
    var x = 0;
    var y = 0;
    var onLine1 = false;
    var onLine2 = false;
    
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    /*
    if (denominator == 0) {
        return false; //The lines are parallel
    }
    */
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        onLine2 = true;
    }

    if (onLine1 == true && onLine2 == true) {
        // if we cast these lines infinitely in both directions, they intersect here:
        x = line1StartX + (a * (line1EndX - line1StartX));
        y = line1StartY + (a * (line1EndY - line1StartY));
		return new Vector2(x, y);
    }

    /*
	else
		return false;
        */
}
