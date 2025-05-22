
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Eye } from "lucide-react";
import { Course } from "@/services/courseService";

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{course.title}</CardTitle>
            <CardDescription className="font-mono">{course.course_code}</CardDescription>
          </div>
          <div className="bg-muted p-2 rounded-full">
            <Book className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description || "No description available"}
        </p>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          Created: {new Date(course.created_at).toLocaleDateString()}
        </div>
        <Button asChild size="sm">
          <Link to={`/courses/${course.course_id}`} state={{ course }}>
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
