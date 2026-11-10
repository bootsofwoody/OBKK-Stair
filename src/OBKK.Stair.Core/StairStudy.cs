namespace OBKK.Stair.Core;

public sealed record StairStudy(
    int RiserCount,
    int LandingCount,
    double TravelDistanceM,
    double ActualRiserHeightMm,
    double RunPerUnitRise)
{
    // Temporary layout assumption for the prototype.
    public const int RisersPerFlight = 16;

    public static StairStudy? Calculate(
        double treadDepthMm, double targetRiserHeightMm, double totalHeightM, double landingLengthM)
    {
        if (treadDepthMm <= 0 || targetRiserHeightMm <= 0 || totalHeightM <= 0)
        {
            return null;
        }

        var totalHeightMm = totalHeightM * 1000;
        var riserCount = (int)Math.Ceiling(totalHeightMm / targetRiserHeightMm);
        var flightCount = (riserCount + RisersPerFlight - 1) / RisersPerFlight;
        var landingCount = flightCount - 1;
        var actualRiserHeightMm = totalHeightMm / riserCount;

        // Each flight ends at a landing or the upper floor.
        var treadCount = riserCount - flightCount;
        var travelDistanceM = treadCount * treadDepthMm / 1000 + landingCount * landingLengthM;

        return new StairStudy(
            riserCount, landingCount, travelDistanceM, actualRiserHeightMm,
            treadDepthMm / actualRiserHeightMm);
    }
}
